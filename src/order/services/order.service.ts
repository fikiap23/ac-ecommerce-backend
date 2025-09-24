import { Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  OrderNetDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from '../dto/order.dto';
import { ProductRepository } from 'src/product/repositories/product.repository';
import { VoucherRepository } from 'src/voucher/repositories/voucher.repository';
import { OrderRepository } from '../repositories/order.repository';
import { CustomerRepository } from 'src/customer/repositories/customer.repository';
import {
  IFilterOrder,
  IOrderPayment,
  ISelectGeneralListOrder,
  ISelectGeneralOrder,
} from '../interfaces/order.interface';
import { GatewayService } from 'src/gateway/services/gateway.service';
import {
  Customer,
  OrderProduct,
  TypeProductPackage,
  TypeProductService,
  TypeStatusOrder,
} from '@prisma/client';
import { GatewayXenditRepository } from 'src/gateway/repositories/gateway-xendit.repository';
import { MailService } from 'src/mail/services/mail.service';
import { CustomError } from 'helpers/http.helper';
import { OrderValidateRepository } from '../repositories/order-validate.repository';
import { omit } from 'lodash';
import {
  formatToISOE164,
  genRandomNumber,
  splitName,
} from 'helpers/data.helper';
import { OrderCallbackPaymentRepository } from '../repositories/order-callback-payment.repository';
import {
  selectGeneralListOrders,
  selectGeneralOrder,
  selectGeneralTrackOrder,
  selectGeneralTrackOrderUuid,
  selectOrderByUuid,
  selectOrderCreate,
  selectTrackIdAndStatus,
} from 'src/prisma/queries/order/props/select-order.prop';
import { selectProductForCreateOrder } from 'src/prisma/queries/product/props/select-product.prop';
import { selectVoucherForCalculate } from 'src/prisma/queries/voucher/props/select-voucher.prop';
import { ISelectVoucherForCalculate } from 'src/voucher/interfaces/voucher.interface';
import {
  IEwalletResponse,
  IPaylaterChargeResponse,
  IQrCodeResponse,
  IRetailOutletResponse,
  IVaResponse,
} from 'src/gateway/interfaces/gateway-xendit.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomerVoucherRepository } from 'src/customer/repositories/customer-voucher.repository';
import { OrderProductRepository } from '../repositories/order-product.repository';
import { BundleRepository } from 'src/product/repositories/bundle.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly gatewayXenditRepository: GatewayXenditRepository,
    private readonly gatewayService: GatewayService,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
    private readonly voucherRepository: VoucherRepository,
    private readonly orderRepository: OrderRepository,
    private readonly orderValidateRepository: OrderValidateRepository,
    private readonly mailService: MailService,
    private readonly orderCallbackPaymentRepository: OrderCallbackPaymentRepository,
    private readonly prismaService: PrismaService,
    private readonly customerVoucher: CustomerVoucherRepository,
    private readonly orderProductRepository: OrderProductRepository,
    private readonly bundleRepository: BundleRepository,
  ) {}

  async validateMembership(authorization: string) {
    return await this.orderValidateRepository.validateIsMembership(
      authorization,
    );
  }

  async createOrder(sub: string, dto: CreateOrderDto) {
    // 1. PARALLEL DATABASE QUERIES - Jalankan semua query bersamaan
    const productCarts = dto.carts.filter((c) => c.type === 'PRODUCT');
    const bundleCarts = dto.carts.filter((c) => c.type === 'BUNDLE');

    const [customer, products, bundles] = await Promise.all([
      this.customerRepository.getThrowByUuid({
        uuid: sub,
      }),

      // Conditional product query
      productCarts.length > 0
        ? this.productRepository.getMany({
            where: {
              uuid: { in: productCarts.map((c) => c.productUuid) },
              isActive: true,
            },
            select: selectProductForCreateOrder,
          })
        : Promise.resolve([]),

      // Conditional bundle query
      bundleCarts.length > 0
        ? this.bundleRepository.getMany({
            where: {
              uuid: { in: bundleCarts.map((c) => c.bundleUuid) },
              isActive: true,
            },
            select: {
              id: true,
              uuid: true,
              name: true,
              isActive: true,
              countTotalSale: true,
              description: true,
              isHide: true,
              minusPrice: true,
              price: true,
              rating: true,
              salePrice: true,
              items: {
                include: {
                  product: true,
                },
              },
              bundleImage: true,
            },
          })
        : Promise.resolve([]),
    ]);

    // 2. PROCESS BUNDLE DATA
    const bundleProducts = bundles.map((bundle) => ({
      ...bundle,
      serviceType: 'BUNDLE',
      packageType: 'BUNDLE',
      productVariant: [],
      productImage: bundle.bundleImage || [],
      type: null,
      model: null,
      capacity: null,
      categoryProduct: null,
      _originalBundle: bundle,
    }));

    const allProducts = [...products, ...bundleProducts];
    const allCarts = [...productCarts, ...bundleCarts];

    // 3. CACHE PAYMENT METHOD FLAGS (inline untuk avoid new function)
    const isVa = this.gatewayXenditRepository.isVa(dto.paymentMethod);
    const isEwallet = this.gatewayXenditRepository.isEwallet(dto.paymentMethod);
    const isQrCode = this.gatewayXenditRepository.isQRCode(dto.paymentMethod);
    const isPaylater = this.gatewayXenditRepository.isPaylater(
      dto.paymentMethod,
    );
    const isRetailOutlet = this.gatewayXenditRepository.isRetailOutlet(
      dto.paymentMethod,
    );

    // 4. PARALLEL VALIDATION & CALCULATION
    const [_, subTotalPay] = await Promise.all([
      this.orderValidateRepository.validateProductsWithVariants(
        allCarts,
        allProducts,
      ),
      this.orderRepository.calculateTotalAmount(allCarts, allProducts),
    ]);

    this.orderValidateRepository.validatePaymentMethod(
      isVa,
      isEwallet,
      isQrCode,
      isPaylater,
      isRetailOutlet,
    );
    this.orderValidateRepository.validateSubTotalPay(
      subTotalPay,
      dto.subTotalPay,
    );

    let totalPayment = subTotalPay;
    let voucherDiscount = 0;
    let deliveryFee = 0;

    const isMembership = sub;
    const useVoucher = isMembership && dto.voucherUuid;

    // 5. CONDITIONAL VOUCHER PROCESSING WITH PARALLEL OPERATIONS
    let voucher: ISelectVoucherForCalculate;
    if (useVoucher) {
      // Parallel voucher fetch and delivery validation
      const [fetchedVoucher] = await Promise.all([
        this.voucherRepository.getThrowByUuid({
          uuid: dto.voucherUuid,
          select: selectVoucherForCalculate,
        }),
        Promise.resolve(
          this.orderValidateRepository.validateAllowedDeliveryService(dto),
        ),
      ]);

      voucher = fetchedVoucher;
      voucherDiscount = await this.orderRepository.calculateVoucher({
        voucher,
        customerId: customer.id,
        carts: allCarts,
        products: allProducts,
        subTotalPay,
      });

      this.orderValidateRepository.validateVoucherDiscount(
        voucherDiscount,
        dto.voucherDiscount,
      );
      totalPayment -= voucherDiscount;
    } else {
      this.orderValidateRepository.validateAllowedDeliveryService(dto);
    }

    totalPayment += deliveryFee;
    this.orderValidateRepository.validateTotalPayment(
      totalPayment,
      dto.totalPayment,
    );

    // 6. GENERATE IDs EARLY
    const orderRefId = `order-${Date.now().toString()}-${genRandomNumber(20)}`;
    const trackId = this.orderRepository.genTrackId(20);

    // 7. PAYMENT GATEWAY PROCESSING (simplified inline)
    let va: IVaResponse | null = null;
    let ewallet: IEwalletResponse | null = null;
    let qrCode: IQrCodeResponse | null = null;
    let paylater: IPaylaterChargeResponse | null = null;
    let retailOutlet: IRetailOutletResponse | null = null;

    // Process only the required payment method (avoid unnecessary checks)
    if (isVa) {
      va = await this.gatewayService.httpPostCreateVa({
        expected_amount: totalPayment,
        name: dto.name,
        bank_code: dto.paymentMethod,
        external_id: orderRefId,
        expiration_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      });
    } else if (isEwallet) {
      const isOVO = dto.paymentMethod === 'ID_OVO';
      ewallet = await this.gatewayService.httpPostChargeEwallet({
        reference_id: orderRefId,
        currency: 'IDR',
        amount: totalPayment,
        checkout_method: 'ONE_TIME_PAYMENT',
        channel_code: dto.paymentMethod,
        channel_properties: isOVO
          ? { mobile_number: dto.phoneNumber }
          : {
              success_redirect_url: `${process.env.FRONTEND_URL}/payment/order-success?id=${trackId}`,
            },
      });
    } else if (isQrCode) {
      qrCode = await this.gatewayService.httpPostQrCode({
        reference_id: orderRefId,
        amount: totalPayment,
        expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      });
    } else if (isPaylater) {
      const splittedName = splitName(dto.name);
      const formattedToE164 = formatToISOE164(dto.phoneNumber);

      // Parallel customer and plan creation for paylater
      const customerXendit = await this.gatewayService.httpPostCustomerXendit({
        reference_id: orderRefId,
        individual_detail: {
          given_names: splittedName.givenNames,
          surname: splittedName.surname,
        },
        email: dto.email,
        mobile_number: formattedToE164,
        addresses: [
          {
            street_line1: dto.shippingAddress.address,
            city: dto.shippingAddress.city,
            postal_code: dto.shippingAddress.postalCode,
            country: 'ID',
          },
        ],
      });

      const paylaterPlan = await this.gatewayService.httpPostPaylaterPlan({
        customer_id: customerXendit.id,
        channel_code: dto.paymentMethod,
        amount: totalPayment,
        order_items: allProducts.map((p) => {
          const cartItem = allCarts.find((c) =>
            c.type === 'PRODUCT'
              ? c.productUuid === p.uuid
              : c.bundleUuid === p.uuid,
          );
          return {
            type: 'PHYSICAL_PRODUCT',
            reference_id: p.uuid,
            name: p.name,
            net_unit_amount: p?.price,
            quantity: cartItem.quantity,
            url: `${process.env.FRONTEND_URL}${
              p.serviceType === 'BUNDLE' ? '/bundle/' : '/catalog/'
            }${p.uuid}`,
            category: p.serviceType === 'BUNDLE' ? 'bundle' : 'product',
          };
        }),
      });

      paylater = await this.gatewayService.httpPostPaylaterCharge({
        plan_id: paylaterPlan.id,
        reference_id: orderRefId,
        success_redirect_url: `${process.env.FRONTEND_URL}/payment/order-success?id=${trackId}`,
        failure_redirect_url: process.env.FRONTEND_URL,
      });
    } else if (isRetailOutlet) {
      retailOutlet = await this.gatewayService.httpPostRetailOutlet({
        reference_id: orderRefId,
        request_amount: totalPayment,
        channel_code: dto.paymentMethod,
        channel_properties: {
          payer_name: dto.name,
          expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // 8. OPTIMIZED DATABASE TRANSACTION
    const data = await this.prismaService.execTx(async (tx) => {
      const toTypeProductService = (
        t?: 'PRODUCT' | 'BUNDLE',
      ): TypeProductService => (t === 'PRODUCT' ? 'PRODUCT' : 'SERVICE');

      // Pre-calculate order products data (avoid heavy computation inside create)
      const orderProductsData = allProducts.map((p) => {
        const cartItem = allCarts.find((c) =>
          c.type === 'BUNDLE'
            ? c.bundleUuid === p.uuid
            : c.productUuid === p.uuid,
        );

        if (!cartItem) {
          throw new CustomError({
            message: `Cart item untuk ${
              p.name ?? '(tanpa nama)'
            } tidak ditemukan`,
            statusCode: 400,
          });
        }

        const isBundle = cartItem.type === 'BUNDLE';
        const isProduct = !isBundle;
        const variant = isProduct
          ? p.productVariant.find((v) => v.uuid === cartItem.productVariantUuid)
          : undefined;

        if (isProduct && !variant) {
          throw new CustomError({
            message: `Varian produk tidak ditemukan untuk produk ${
              p.name ?? '(tanpa nama)'
            }`,
            statusCode: 404,
          });
        }

        const price = isProduct
          ? variant!.salePrice ?? variant!.regularPrice
          : p.salePrice ?? p.price;

        if (price == null || Number.isNaN(Number(price))) {
          throw new CustomError({
            message: isBundle
              ? `Harga bundle ${p.name ?? '(tanpa nama)'} tidak valid`
              : `Harga varian ${p.name ?? '(tanpa nama)'} tidak valid`,
            statusCode: 400,
          });
        }

        return {
          deviceId: cartItem.deviceId ?? null,
          name: p.name ?? '',
          brand: p.brand ?? null,
          description: p.description ?? '',
          type: p.type?.name ?? null,
          model: p.model?.name ?? null,
          capacity: p.capacity?.name ?? null,
          price: Number(price),
          packageType: isBundle ? TypeProductPackage.BUNDLE : p.packageType,
          serviceType: toTypeProductService(cartItem.type),
          category: p.categoryProduct?.name ?? null,
          orderProductId: p.id,
          orderProductVariantId: isProduct ? variant!.id : undefined,
          quantity: cartItem.quantity,
          discount: 0,

          ...(isBundle && {
            bundleId: p._originalBundle?.id ?? p.id,
            orderBundleItems: {
              create: (p._originalBundle?.items ?? []).map((item: any) => ({
                productId: item.productId ?? null,
                productUuid: item.product?.uuid ?? null,
                productName: item.product?.name ?? '',
                productPrice: Number(
                  item.product?.salePrice ?? item.product?.price ?? 0,
                ),
              })),
            },
          }),

          orderProductImage: {
            create: (p.productImage ?? []).map((pi: any) => ({
              url: pi.url,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          },

          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      const createdOrder = await tx.order.create({
        data: {
          trackId,
          name: dto.name,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          paymentMethod: dto.paymentMethod,
          deliveryService: dto.deliveryService,
          expiredAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          subTotalPay,
          deliveryFee,
          totalPayment,
          customerId: customer.id,
          orderAddress: { create: dto.shippingAddress },
          recipientAddress: { create: dto.recipientAddress },
          orderProduct: { create: orderProductsData },
          orderCallbackPayment: {
            create: {
              xenditId:
                va?.id ||
                ewallet?.id ||
                qrCode?.id ||
                paylater?.id ||
                retailOutlet?.payment_request_id,
              va: va?.account_number,
              externalId: va?.external_id,
              referenceId: ewallet?.reference_id,
              qrReferenceId: qrCode?.reference_id,
              qrString: qrCode?.qr_string,
              desktopCheckoutUrl: ewallet?.actions?.desktop_web_checkout_url,
              mobileCheckoutUrl: ewallet?.actions?.mobile_web_checkout_url,
              deepLinkCheckoutUrl:
                ewallet?.actions?.mobile_deeplink_checkout_url,
              qrCheckoutString: ewallet?.actions?.qr_checkout_string,
              retailOutletCode: retailOutlet?.actions[0]?.value,
              retailOutletReferenceId: retailOutlet?.reference_id,
              paylaterReferenceId: paylater?.reference_id,
              paylaterDesktopWebCheckoutUrl:
                paylater?.actions?.desktop_web_checkout_url,
              paylaterMobileWebCheckoutUrl:
                paylater?.actions?.mobile_web_checkout_url,
              paylaterMobileDeeplinkCheckoutUrl:
                paylater?.actions?.mobile_deeplink_checkout_url,
            },
          },
        },
        select: selectOrderCreate,
      });

      // Parallel voucher update if needed
      if (useVoucher) {
        await tx.voucher.update({
          where: { uuid: dto.voucherUuid },
          data: { quota: { decrement: 1 } },
        });
      }

      return createdOrder;
    });

    // 9. ASYNC EMAIL SENDING - Don't block response
    setImmediate(async () => {
      try {
        await this.mailService.sendInvoice({
          subject: '[NEO] Menunggu Pembayaran - Pesanan Anda',
          title: 'Selesaikan Pesanan Anda',
          description:
            'Baru saja membuat pesanan? 📝 Klik Selesaikan Pesanan, masukkan ID Pesanan Anda, lalu ikuti langkah-langkah untuk melakukan pembayaran dan konfirmasi! 💳🛒',
          buttonText: 'Selesaikan Pesanan',
          link: `${process.env.FRONTEND_URL}/payment/${trackId}`,
          email: data.email,
          order: {
            id: trackId,
            name: data.name,
            phone: data.phoneNumber,
            email: data.email,
            address: data.orderAddress.address,
            products: allProducts.map((p) => {
              const cartItem = allCarts.find((c) =>
                c.type === 'PRODUCT'
                  ? c.productUuid === p.uuid
                  : c.bundleUuid === p.uuid,
              );

              if (!cartItem) {
                throw new CustomError({
                  message: `Cart item untuk ${
                    p.serviceType === 'BUNDLE' ? 'bundle' : 'produk'
                  } ${p.name ?? '(tanpa nama)'} tidak ditemukan`,
                  statusCode: 400,
                });
              }

              const isProductType =
                String(p.serviceType).toUpperCase() === 'PRODUCT';
              const isBundleType =
                String(p.serviceType).toUpperCase() === 'BUNDLE';

              if (isProductType) {
                if (!cartItem.productVariantUuid) {
                  throw new CustomError({
                    message: `Varian wajib dipilih untuk produk ${p.name}`,
                    statusCode: 400,
                  });
                }

                const variant = p.productVariant.find(
                  (v) => v.uuid === cartItem.productVariantUuid,
                );
                if (!variant) {
                  throw new CustomError({
                    message: `Varian produk tidak ditemukan untuk produk ${p.name}`,
                    statusCode: 404,
                  });
                }

                return {
                  name: `${p.name} - ${variant.name}`,
                  price: String(variant.salePrice ?? variant.regularPrice),
                  qty: cartItem.quantity,
                  discount: '0',
                };
              }

              const priceNum = p.salePrice ?? p.price;
              if (priceNum == null || Number.isNaN(Number(priceNum))) {
                throw new CustomError({
                  message: `Harga ${isBundleType ? 'bundle' : 'layanan'} ${
                    p.name ?? '(tanpa nama)'
                  } tidak valid`,
                  statusCode: 400,
                });
              }

              return {
                name: isBundleType ? `[Bundle] ${p.name}` : p.name,
                price: String(priceNum),
                qty: cartItem.quantity,
                discount: '0',
              };
            }),
            subtotal: data.subTotalPay.toString(),
            totalDiscount:
              sub && dto.voucherUuid ? dto.voucherDiscount.toString() : '0',
            deliveryFee: data.deliveryFee.toString(),
            total: data.totalPayment.toString(),
            status: this.orderRepository.formatOrderStatus(
              TypeStatusOrder.WAITING_PAYMENT,
            ),
            statusColor: '#fa7c46',
          },
        });
      } catch (error) {
        console.error('Email sending failed:', error);
      }
    });

    return { orderId: trackId };
  }

  async getOrderByUuid(uuid: string) {
    const order = await this.orderRepository.getThrowByUuid({
      uuid,
      select: selectOrderByUuid,
    });

    if (order.expiredAt && order.expiredAt < new Date()) {
      await this.orderRepository.update({
        where: { id: order.id },
        data: {
          status: TypeStatusOrder.CANCELLED,
          expiredAt: null,
        },
      });

      if (order.voucherId) {
        await this.voucherRepository.updateById({
          id: order.voucherId,
          data: {
            quota: {
              increment: 1,
            },
          },
        });
      }

      const isVa = this.gatewayXenditRepository.isVa(order.paymentMethod);
      const orderCallbackPayment =
        await this.orderCallbackPaymentRepository.getThrowByOrderId({
          orderId: order.id,
        });
      if (isVa) {
        await this.gatewayService.httpPatchVa(orderCallbackPayment.xenditId, {
          expiration_date: new Date(),
        });
      }

      order.status = TypeStatusOrder.CANCELLED;
      order.expiredAt = null;
    }

    const { id, voucherId, customerId, ...response } = order;

    return response;
  }

  async getPayment(trackId: string) {
    const order = await this.orderRepository.getThrowByTrackId({
      trackId,
      select: selectTrackIdAndStatus,
    });

    if (order.expiredAt && order.expiredAt < new Date()) {
      await this.orderRepository.update({
        where: { id: order.id },
        data: {
          status: TypeStatusOrder.CANCELLED,
          expiredAt: null,
        },
      });

      if (order.voucherId) {
        await this.voucherRepository.updateById({
          id: order.voucherId,
          data: {
            quota: {
              increment: 1,
            },
          },
        });
      }

      const isVa = this.gatewayXenditRepository.isVa(order.paymentMethod);
      const orderCallbackPayment =
        await this.orderCallbackPaymentRepository.getThrowByOrderId({
          orderId: order.id,
        });
      if (isVa) {
        await this.gatewayService.httpPatchVa(orderCallbackPayment.xenditId, {
          expiration_date: new Date(),
        });
      }

      order.status = TypeStatusOrder.CANCELLED;
      order.expiredAt = null;
    }

    const { id, voucherId, exchangePoint, customerId, ...response } = order;

    return response;
  }

  async orderPayment(token: string, dto: IOrderPayment) {
    const tokenVerification = process.env.XENDIT_TOKEN_VERIFICATION_WEBHOOK;

    if (token !== tokenVerification) {
      throw new CustomError({ message: 'Unauthorized', statusCode: 401 });
    }

    const fromVa = dto?.payment_id;
    const fromEWallet = dto?.event === 'ewallet.capture';
    const fromQrCode = dto?.event === 'qr.payment';
    const fromPaylater = dto?.event === 'paylater.payment';
    const fromRetailOutlet =
      dto?.data?.channel_code === 'ALFAMART' ||
      dto?.data?.channel_code === 'INDOMARET';

    let order: ISelectGeneralOrder;

    if (fromVa) {
      const orderCallback =
        await this.orderCallbackPaymentRepository.getThrowByExternalId({
          externalId: dto.external_id,
        });
      order = await this.orderRepository.getThrowById({
        id: orderCallback.orderId,
        select: selectGeneralOrder,
      });
    }

    if (fromEWallet) {
      const orderCallback =
        await this.orderCallbackPaymentRepository.getThrowByReferenceId({
          referenceId: dto.data.reference_id,
        });
      order = await this.orderRepository.getThrowById({
        id: orderCallback.orderId,
        select: selectGeneralOrder,
      });
    }

    if (fromQrCode) {
      const orderCallback =
        await this.orderCallbackPaymentRepository.getThrowByQrReferenceId({
          qrReferenceId: dto.data.reference_id,
        });
      order = await this.orderRepository.getThrowById({
        id: orderCallback.orderId,
        select: selectGeneralOrder,
      });
    }

    if (fromPaylater) {
      const orderCallback =
        await this.orderCallbackPaymentRepository.getThrowByPaylaterReferenceId(
          {
            paylaterReferenceId: dto.data.reference_id,
          },
        );
      order = await this.orderRepository.getThrowById({
        id: orderCallback.orderId,
        select: selectGeneralOrder,
      });
    }

    if (fromRetailOutlet) {
      const orderCallback =
        await this.orderCallbackPaymentRepository.getThrowByRetailOutletReferenceId(
          {
            retailOutletReferenceId: dto.data.reference_id,
          },
        );
      order = await this.orderRepository.getThrowById({
        id: orderCallback.orderId,
        select: selectGeneralOrder,
      });
    }

    if (order?.expiredAt < new Date()) {
      await this.orderRepository.update({
        where: { id: order.id },
        data: {
          status: TypeStatusOrder.CANCELLED,
          expiredAt: null,
        },
      });

      throw new CustomError({
        message: 'Order Expired',
        statusCode: 400,
      });
    }

    await this.orderRepository.update({
      where: { id: order.id },
      data: {
        status: TypeStatusOrder.ON_PROGRESS,
        expiredAt: null,
      },
    });

    if (order.customerId) {
      const customer = await this.customerRepository.getThrowById({
        id: order.customerId,
      });

      if (order.voucherId) {
        await this.customerVoucher.upsert({
          where: {
            customerId_voucherId: {
              customerId: customer.id,
              voucherId: order.voucherId,
            },
          },
          update: {
            usageCount: { increment: 1 },
          },
          create: {
            customer: { connect: { id: customer.id } },
            voucher: { connect: { id: order.voucherId } },
            usageCount: 1,
          },
        });
      }
    }

    await this.mailService.sendInvoice({
      subject: '[NEO] Receipt - Your Order',
      title: 'Check Tracking',
      description:
        'Want real-time updates on your order? 📦 Click "Check Tracking", enter your Order ID, and stay informed every step of the way! 🚀',
      buttonText: 'Check Tracking',
      link: `${process.env.FRONTEND_URL}/track-order/${order.trackId}`,
      email: order.email,
      order: {
        id: order.trackId,
        name: order.name,
        phone: order.phoneNumber,
        email: order.email,
        address: order.orderAddress.address,
        products: order.orderProduct.map((p) => ({
          name: p.name,
          price: p?.price?.toString(),
          qty: p.quantity,
          discount: p.discount.toString(),
        })),
        subtotal: order.subTotalPay.toString(),
        totalDiscount: order.voucherDiscount.toString(),
        deliveryFee: order.deliveryFee.toString(),
        total: order.totalPayment.toString(),
        status: this.orderRepository.formatOrderStatus(
          TypeStatusOrder.ON_PROGRESS,
        ),
        statusColor: '#4673fa',
      },
    });

    return { status: 'success' };
  }

  async orderCancel(trackId: string) {
    const order = await this.orderRepository.getThrowByTrackId({
      trackId,
    });
    this.orderValidateRepository.validateCancelOrderExpired(order.expiredAt);
    this.orderValidateRepository.validateCancelOrderStatus(order.status);
    await this.orderRepository.update({
      where: { id: order.id },
      data: {
        status: TypeStatusOrder.CANCELLED,
        expiredAt: null,
      },
    });
    if (order.voucherId) {
      await this.voucherRepository.updateById({
        id: order.voucherId,
        data: {
          quota: {
            increment: 1,
          },
        },
      });
    }

    const isVa = this.gatewayXenditRepository.isVa(order.paymentMethod);
    const orderCallbackPayment =
      await this.orderCallbackPaymentRepository.getThrowByOrderId({
        orderId: order.id,
      });
    if (isVa) {
      await this.gatewayService.httpPatchVa(orderCallbackPayment.xenditId, {
        expiration_date: new Date(),
      });
    }
    return;
  }

  async getAllOrders(filter: IFilterOrder) {
    const orders = await this.orderRepository.getManyPaginate({
      filter,
      select: selectGeneralListOrders,
    });

    const statusMap: Record<
      'Delivered' | 'Shipped' | 'Packed',
      TypeStatusOrder
    > = {
      Delivered: TypeStatusOrder.DELIVERED,
      Shipped: TypeStatusOrder.SHIPPED,
      Packed: TypeStatusOrder.PACKED,
    };

    await Promise.all(
      orders.data.map(async (order: ISelectGeneralListOrder) => {
        if (order.expiredAt && order.expiredAt < new Date()) {
          await this.orderRepository.update({
            where: { id: order.id },
            data: {
              status: TypeStatusOrder.CANCELLED,
              expiredAt: null,
            },
          });

          if (order.voucherId) {
            await this.voucherRepository.updateById({
              id: order.voucherId,
              data: {
                quota: {
                  increment: 1,
                },
              },
            });
          }

          const isVa = this.gatewayXenditRepository.isVa(order.paymentMethod);
          const orderCallbackPayment =
            await this.orderCallbackPaymentRepository.getThrowByOrderId({
              orderId: order.id,
            });
          if (isVa) {
            await this.gatewayService.httpPatchVa(
              orderCallbackPayment.xenditId,
              {
                expiration_date: new Date(),
              },
            );
          }

          order.status = TypeStatusOrder.CANCELLED;
          order.expiredAt = null;
        }

        const isUpdatable =
          order.status === TypeStatusOrder.ON_PROGRESS ||
          order.status === TypeStatusOrder.PACKED ||
          order.status === TypeStatusOrder.SHIPPED;

        if (!isUpdatable || !order.trackId) return;
      }),
    );

    return {
      data: orders.data.map((order: ISelectGeneralListOrder) => {
        return {
          uuid: order.uuid,
          orderProduct: order.orderProduct,
          trackId: order.trackId,
          createdAt: order.createdAt,
          name: order.name,
          orderAddress: order.orderAddress,
          totalPayment: order.totalPayment,
          netAmount: order.netAmount,
          isNetAmountCalculated: order.isNetAmountCalculated,
          status: order.status,
          expiredAt: order.expiredAt,
        };
      }),
      meta: orders.meta,
    };
  }

  async netOrder(dto: OrderNetDto) {
    const transactions = await this.gatewayXenditRepository.httpGetTransactions(
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    );

    const orders = await this.orderRepository.getMany({
      where: {
        createdAt: {
          gte: new Date(dto.startDate),
          lte: new Date(dto.endDate),
        },
      },
      select: selectGeneralListOrders,
    });

    await Promise.all(
      orders.map(async (order) => {
        const ref = order.orderCallbackPayment;

        const matchTransaction = transactions.data.find((transaction) => {
          switch (transaction.channel_category) {
            case 'VIRTUAL_ACCOUNT':
              return transaction.reference_id === ref?.externalId;
            case 'EWALLET':
              return transaction.reference_id === ref?.referenceId;
            case 'QR_CODE':
              return transaction.reference_id === ref?.qrReferenceId;
            case 'PAYLATER':
              return transaction.reference_id === ref?.paylaterReferenceId;
            case 'RETAIL_OUTLET':
              return transaction.reference_id === ref?.retailOutletReferenceId;
            default:
              return false;
          }
        });

        if (!matchTransaction) return null;

        return await this.orderRepository.update({
          where: {
            id: order.id,
          },
          data: {
            xenditFee: matchTransaction.fee.xendit_fee,
            xenditFeeVat: matchTransaction.fee.value_added_tax,
            netAmount: matchTransaction.net_amount,
            isNetAmountCalculated: true,
          },
        });
      }),
    );
  }

  async getOrderByTrackId(trackId: string) {
    let order = await this.orderRepository.getThrowByTrackId({
      trackId,
      select: selectGeneralTrackOrderUuid,
    });

    if (order.expiredAt && order.expiredAt < new Date()) {
      await this.orderRepository.update({
        where: { id: order.id },
        data: {
          status: TypeStatusOrder.CANCELLED,
          expiredAt: null,
        },
      });

      if (order.voucherId) {
        await this.voucherRepository.updateById({
          id: order.voucherId,
          data: {
            quota: {
              increment: 1,
            },
          },
        });
      }

      const isVa = this.gatewayXenditRepository.isVa(order.paymentMethod);
      const orderCallbackPayment =
        await this.orderCallbackPaymentRepository.getThrowByOrderId({
          orderId: order.id,
        });
      if (isVa) {
        await this.gatewayService.httpPatchVa(orderCallbackPayment.xenditId, {
          expiration_date: new Date(),
        });
      }

      order.status = TypeStatusOrder.CANCELLED;
      order.expiredAt = null;
    }

    const { id, voucherId, customerId, paymentMethod, ...response } = order;

    return response;
  }

  async updateOrderStatus(dto: UpdateOrderStatusDto) {
    const { orderUuid, productOrders, scheduleAt, ...rest } = dto;

    // Validasi scheduleAt
    const scheduleAtDate = scheduleAt ? new Date(scheduleAt) : undefined;
    if (scheduleAt && isNaN(scheduleAtDate.getTime())) {
      throw new CustomError({
        message: 'scheduleAt tidak valid (harus ISO string)',
        statusCode: 400,
      });
    }

    type OrderUpdateInput = {
      status?: TypeStatusOrder;
      technicianUuid?: string | null;
      driverUuid?: string | null;
      notes?: string | null;
      scheduleAt?: Date | null;
    };

    return this.prismaService.execTx(async (tx) => {
      // Check order
      const order = await this.orderRepository.getThrowByUuid({
        uuid: orderUuid,
        select: selectGeneralOrder,
        tx,
      });

      const data: OrderUpdateInput = {
        status: rest.status,
        technicianUuid: rest.technicianUuid,
        driverUuid: rest.driverUuid,
        notes: rest.notes,
        scheduleAt: scheduleAtDate,
      };

      await this.orderRepository.update({
        where: { uuid: orderUuid },
        data,
        tx,
      });

      // Update productOrders
      if (productOrders?.length) {
        const ids = productOrders.map((p) => p.orderProductUuid);

        const found = await this.orderProductRepository.getMany({
          where: { orderId: order.id, uuid: { in: ids } },
          select: { uuid: true },
          tx,
        });

        const validSet = new Set(found.map((x) => x.uuid));
        const invalid = productOrders.filter(
          (p) => !validSet.has(p.orderProductUuid),
        );

        if (invalid.length > 0) {
          throw new CustomError({
            message: `orderProductUuid tidak valid: ${invalid
              .map((i) => i.orderProductUuid)
              .join(', ')}`,
            statusCode: 400,
          });
        }

        for (const p of productOrders) {
          await this.orderProductRepository.updateByUuid({
            uuid: p.orderProductUuid,
            data: { deviceId: p.deviceId },
            tx,
          });
        }
      }

      return null;
    });
  }
}
