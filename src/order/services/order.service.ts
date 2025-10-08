import { Injectable } from '@nestjs/common';
import {
  CompleteOrderProductsDto,
  CreateOrderDto,
  DeviceListFilterDto,
  OrderNetDto,
  UpdateOrderProductByUuidDto,
  UpdateOrderStatusDto,
} from '../dto/order.dto';
import { ProductRepository } from 'src/product/repositories/product.repository';
import { VoucherRepository } from 'src/voucher/repositories/voucher.repository';
import { OrderRepository } from '../repositories/order.repository';
import { CustomerRepository } from 'src/customer/repositories/customer.repository';
import {
  IFilterOrder,
  IFilterReportSummary,
  IFilterReportTransactionStats,
  IOrderPayment,
  ISelectGeneralListOrder,
  ISelectGeneralOrder,
} from '../interfaces/order.interface';
import { GatewayService } from 'src/gateway/services/gateway.service';
import { Prisma, TypeStatusOrder } from '@prisma/client';
import { GatewayXenditRepository } from 'src/gateway/repositories/gateway-xendit.repository';
import { MailService } from 'src/mail/services/mail.service';
import { CustomError } from 'helpers/http.helper';
import { OrderValidateRepository } from '../repositories/order-validate.repository';
import {
  formatToISOE164,
  genRandomNumber,
  splitName,
} from 'helpers/data.helper';
import { OrderCallbackPaymentRepository } from '../repositories/order-callback-payment.repository';
import {
  selectGeneralListOrders,
  selectGeneralOrder,
  selectGeneralTrackOrderUuid,
  selectOrderByUuid,
  selectOrderCreate,
  selectOrderProductDevice,
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
import { CustomerProductRepository } from 'src/customer/repositories/customer-product.repository';
import { TechnicianRepository } from 'src/technician/repositories/technician.repository';
import { DriverRepository } from 'src/driver/repositories/driver.repository';
import * as luxon from 'luxon';
import { getDay, getMonth } from 'helpers/date.helper';
import * as path from 'path';
import * as fs from 'fs/promises';
import { genIdPrefixTimestamp, genSlug } from 'helpers/data.helper';

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
    private readonly customerProductRepository: CustomerProductRepository,
    private readonly technicianRepository: TechnicianRepository,
    private readonly driverRepository: DriverRepository,
  ) {}

  async validateMembership(authorization: string) {
    return await this.orderValidateRepository.validateIsMembership(
      authorization,
    );
  }

  async createOrder(sub: string, dto: CreateOrderDto) {
    const customer = await this.customerRepository.getThrowByUuid({
      uuid: sub,
    });

    // === Ambil cart dari customerProductRepository (bawa info bundle) ===
    const cart = await this.customerProductRepository.getMany({
      where: {
        uuid: { in: dto.carts.map((c) => c.cartUuid) },
      },
      select: {
        uuid: true,
        quantity: true,
        deviceId: true,
        bundle: {
          select: {
            uuid: true,
            name: true,
            minusPrice: true,
            bundleImage: {
              select: {
                url: true,
              },
            },
          },
        },
        product: {
          select: {
            uuid: true,
            name: true,
            productImage: {
              select: {
                url: true,
              },
            },
          },
        },
        productVariant: {
          select: {
            id: true,
            uuid: true,
            photoUrl: true,
            name: true,
            code: true,
            capacity: true,
            product: { select: { uuid: true } },
          },
        },
        customerProductBundle: {
          select: {
            deviceId: true,
            product: { select: { uuid: true, name: true, productImage: true } },
            productVariant: {
              select: {
                id: true,
                uuid: true,
                photoUrl: true,
                name: true,
                code: true,
                product: { select: { uuid: true, productImage: true } },
              },
            },
          },
        },
      },
    });

    const carts = this.orderRepository.mapToCarts(cart);

    // === Ambil produk aktif buat validasi & harga ===
    const products = await this.productRepository.getMany({
      where: {
        uuid: { in: carts.map((c) => c.productUuid) },
        isActive: true,
      },
      select: selectProductForCreateOrder,
    });

    // Validasi produk + variant (pakai repo validasi kamu)
    await this.orderValidateRepository.validateProductsWithVariants(
      carts,
      products,
    );

    // Index produk by uuid untuk lookup cepat
    const productByUuid = new Map(products.map((p: any) => [p.uuid, p]));
    const pickVariant = (p: any, variantUuid?: string | null) => {
      if (!variantUuid) return undefined;
      return (p.productVariant ?? []).find((v: any) => v.uuid === variantUuid);
    };

    // === Validasi & setup payment method ===
    const isVa = this.gatewayXenditRepository.isVa(dto.paymentMethod);
    const isEwallet = this.gatewayXenditRepository.isEwallet(dto.paymentMethod);
    const isQrCode = this.gatewayXenditRepository.isQRCode(dto.paymentMethod);
    const isPaylater = this.gatewayXenditRepository.isPaylater(
      dto.paymentMethod,
    );
    const isRetailOutlet = this.gatewayXenditRepository.isRetailOutlet(
      dto.paymentMethod,
    );

    this.orderValidateRepository.validatePaymentMethod(
      isVa,
      isEwallet,
      isQrCode,
      isPaylater,
      isRetailOutlet,
    );

    // === Perhitungan total ===
    let subTotalPay = 0;
    let voucherDiscount = 0;
    let deliveryFee = 0;
    let totalPayment = 0;

    const minusPrice = cart.reduce((acc: number, c: any) => {
      const qty = Number(c.quantity ?? 1);
      const minus = Number(c.bundle?.minusPrice ?? 0);
      return acc + minus * qty;
    }, 0);

    const isMembership = sub;
    const useVoucher = isMembership && dto.voucherUuid;

    // Hitung total berdasarkan variant + minusPrice bundle
    subTotalPay = await this.orderRepository.calculateTotalAmount(
      carts,
      products,
      minusPrice,
    );

    this.orderValidateRepository.validateSubTotalPay(
      subTotalPay,
      dto.subTotalPay,
    );
    totalPayment += subTotalPay;

    let voucher: ISelectVoucherForCalculate | undefined;
    if (useVoucher) {
      voucher = await this.voucherRepository.getThrowByUuid({
        uuid: dto.voucherUuid,
        select: selectVoucherForCalculate,
      });

      voucherDiscount = await this.orderRepository.calculateVoucher({
        voucher,
        customerId: customer.id,
        carts: carts,
        products,
        subTotalPay,
      });

      this.orderValidateRepository.validateVoucherDiscount(
        voucherDiscount,
        dto.voucherDiscount,
      );

      totalPayment -= voucherDiscount;
    }

    this.orderValidateRepository.validateAllowedDeliveryService(dto);

    totalPayment += deliveryFee;

    this.orderValidateRepository.validateTotalPayment(
      totalPayment,
      dto.totalPayment,
    );

    // === Payment gateway payloads ===
    let va: IVaResponse | null = null;
    let ewallet: IEwalletResponse | null = null;
    let qrCode: IQrCodeResponse | null = null;
    let paylater: IPaylaterChargeResponse | null = null;
    let retailOutlet: IRetailOutletResponse | null = null;

    const orderRefId = `order-${Date.now().toString()}-${genRandomNumber(20)}`;
    const trackId = this.orderRepository.genTrackId(20);

    if (isVa) {
      va = await this.gatewayService.httpPostCreateVa({
        expected_amount: totalPayment,
        name: dto.name,
        bank_code: dto.paymentMethod,
        external_id: orderRefId,
        expiration_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      });
    }

    if (isEwallet) {
      const isOVO = dto.paymentMethod === 'ID_OVO';
      const ewalletPayload = {
        reference_id: orderRefId,
        currency: 'IDR',
        amount: totalPayment,
        checkout_method: 'ONE_TIME_PAYMENT',
        channel_code: dto.paymentMethod,
        channel_properties: isOVO
          ? { mobile_number: dto.phoneNumber }
          : {
              success_redirect_url:
                process.env.FRONTEND_URL +
                `/payment/order-success?id=${trackId}`,
            },
      };
      ewallet = await this.gatewayService.httpPostChargeEwallet(ewalletPayload);
    }

    if (isQrCode) {
      qrCode = await this.gatewayService.httpPostQrCode({
        reference_id: orderRefId,
        amount: totalPayment,
        expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      });
    }

    if (isPaylater) {
      const splittedName = splitName(dto.name);
      const formattedToE164 = formatToISOE164(dto.phoneNumber);
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

      // Order items harus mengikuti carts
      // Definisikan tipe item xendit (atau import dari SDK kamu kalau ada)
      type XenditOrderItem = {
        type: 'PHYSICAL_PRODUCT';
        reference_id: string;
        name: string;
        net_unit_amount: number;
        quantity: number;
        url: string;
        category: string;
      };

      const order_items: XenditOrderItem[] = carts.map(
        (ci): XenditOrderItem => {
          const p = productByUuid.get(ci.productUuid);
          if (!p) {
            throw new CustomError({
              message: `Produk dengan UUID ${String(
                ci.productUuid,
              )} tidak ditemukan/ tidak aktif`,
              statusCode: 400,
            });
          }

          const isProductType =
            String(p.serviceType).toUpperCase() === 'PRODUCT';
          let name = String(p.name ?? 'Produk');
          let priceNum: number;

          if (isProductType) {
            const variant = pickVariant(p, ci.productVariantUuid);
            if (!variant) {
              throw new CustomError({
                message: `Varian produk tidak ditemukan untuk ${String(
                  p.name ?? '(tanpa nama)',
                )}`,
                statusCode: 404,
              });
            }
            priceNum = Number(variant.salePrice ?? variant.regularPrice);
            name = `${name} - ${String(variant.name ?? '')}`;
          } else {
            priceNum = Number(p.salePrice ?? p.price);
          }

          if (!Number.isFinite(priceNum)) {
            throw new CustomError({
              message: isProductType
                ? `Harga varian ${String(p.name ?? '(tanpa nama)')} tidak valid`
                : `Harga layanan ${String(
                    p.name ?? '(tanpa nama)',
                  )} tidak valid`,
              statusCode: 400,
            });
          }

          return {
            type: 'PHYSICAL_PRODUCT', // literal terkunci
            reference_id: String(p.uuid),
            name,
            net_unit_amount: priceNum,
            quantity: Number(ci.quantity ?? 1),
            url: `${process.env.FRONTEND_URL}/catalog/${String(p.uuid)}`,
            category: 'product',
          };
        },
      );

      const paylaterPlan = await this.gatewayService.httpPostPaylaterPlan({
        customer_id: customerXendit.id,
        channel_code: dto.paymentMethod,
        amount: totalPayment,
        order_items,
      });

      paylater = await this.gatewayService.httpPostPaylaterCharge({
        plan_id: paylaterPlan.id,
        reference_id: orderRefId,
        success_redirect_url:
          process.env.FRONTEND_URL + `/payment/order-success?id=${trackId}`,
        failure_redirect_url: process.env.FRONTEND_URL,
      });
    }

    if (isRetailOutlet) {
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

    // === Transaction ===
    const data = await this.prismaService.execTx(async (tx) => {
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
          discountBundle: minusPrice,

          ...(dto.shippingAddress && {
            orderAddress: { create: dto.shippingAddress },
          }),
          ...(dto.recipientAddress && {
            recipientAddress: { create: dto.recipientAddress },
          }),

          // Penting: create berdasarkan DTO CARTS (bukan products.map)
          orderProduct: {
            create: carts.map((ci) => {
              const p = productByUuid.get(ci.productUuid);
              if (!p) {
                throw new CustomError({
                  message: `Produk dengan UUID ${ci.productUuid} tidak ditemukan/ tidak aktif`,
                  statusCode: 400,
                });
              }

              const isProductType =
                String(p.serviceType).toUpperCase() === 'PRODUCT';
              const variant = isProductType
                ? pickVariant(p, ci.productVariantUuid)
                : undefined;

              if (isProductType && !variant) {
                throw new CustomError({
                  message: `Varian produk tidak ditemukan untuk produk ${
                    p.name ?? '(tanpa nama)'
                  }`,
                  statusCode: 404,
                });
              }

              const price = isProductType
                ? variant!.salePrice ?? variant!.regularPrice
                : p.salePrice ?? p.price;

              if (price == null || Number.isNaN(Number(price))) {
                throw new CustomError({
                  message: isProductType
                    ? `Harga varian ${p.name ?? '(tanpa nama)'} tidak valid`
                    : `Harga layanan ${p.name ?? '(tanpa nama)'} tidak valid`,
                  statusCode: 400,
                });
              }

              const typeName = p.type?.name ?? null;
              const modelName = p.model?.name ?? null;
              const capacityName = variant?.capacity?.name ?? p.capacity?.name;
              const categoryName = p.categoryProduct?.name ?? null;

              return {
                deviceId: ci.deviceId ?? null,
                name: p.name ?? '',
                brand: p.brand ?? null,
                description: p.description ?? null,
                type: typeName,
                model: modelName,
                capacity: capacityName,
                price: Number(price),

                // Produk atomik tetap SINGLE (ikut katalog)
                packageType: p.packageType,
                serviceType: p.serviceType,

                category: categoryName,
                orderProductId: p.id,
                orderProductVariantId: isProductType ? variant!.id : undefined,
                orderProductUuid: ci.productUuid,
                orderProductVariantUuid: isProductType
                  ? ci.productVariantUuid
                  : undefined,
                quantity: ci.quantity,
                discount: 0,

                createdAt: new Date(),
                updatedAt: new Date(),

                // variant
                variantId: ci.variantId ?? null,
                variantUuid: ci.variantUuid ?? null,
                variantCode: ci.variantCode ?? null,
                variantName: ci.variantName ?? null,
                variantImage: ci.variantImage ?? null,

                // bunde
                sourcePackageType: ci.sourcePackageType ?? 'SINGLE',
                bundleGroupId: ci.bundleGroupId ?? null,
                bundleName: ci.bundleName ?? null,
                minusPrice: ci.minusPrice ?? null,
                bundleImage: ci.bundleImage ?? null,

                orderProductImage: {
                  create: (p.productImage ?? []).map((pi: any) => ({
                    url: pi.url,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  })),
                },
              };
            }),
          },

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
              retailOutletCode: retailOutlet?.actions?.[0]?.value,
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

      if (useVoucher) {
        await tx.voucher.update({
          where: { uuid: dto.voucherUuid },
          data: { quota: { decrement: 1 } },
        });
      }

      for (const item of cart as any[]) {
        const qty = item.quantity ?? 1;

        // kalau ada bundle
        if (item.bundle) {
          await tx.bundle.update({
            where: { uuid: item.bundle.uuid },
            data: { countTotalSale: { increment: qty } },
          });

          // update semua product dalam bundle
          for (const pb of item.customerProductBundle ?? []) {
            const product = pb.product ?? pb.productVariant?.product;
            if (product?.uuid) {
              await tx.product.update({
                where: { uuid: product.uuid },
                data: { countTotalSale: { increment: qty } },
              });
            }
          }

          continue;
        }

        // kalau cuma product biasa
        const product = item.productVariant?.product ?? item.product;
        if (product?.uuid) {
          await tx.product.update({
            where: { uuid: product.uuid },
            data: { countTotalSale: { increment: qty } },
          });
        }
      }

      await tx.customerProduct.deleteMany({
        where: { uuid: { in: dto.carts.map((c) => c.cartUuid) } },
      });

      return createdOrder;
    });

    // === Email invoice: ikut DTO CARTS juga ===
    await this.mailService.sendInvoice({
      subject: '[G-Solusi] Menunggu Pembayaran - Pesanan Anda',
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
        address: data?.recipientAddress?.address ?? 'Pickup Store',

        products: carts.map((ci: any) => {
          const p = productByUuid.get(ci.productUuid);
          if (!p) {
            throw new CustomError({
              message: `Produk dengan UUID ${ci.productUuid} tidak ditemukan/ tidak aktif`,
              statusCode: 400,
            });
          }

          const isProductType =
            String(p.serviceType).toUpperCase() === 'PRODUCT';

          if (isProductType) {
            if (!ci.productVariantUuid) {
              throw new CustomError({
                message: `Varian wajib dipilih untuk produk ${p.name}`,
                statusCode: 400,
              });
            }

            const variant = pickVariant(p, ci.productVariantUuid);
            if (!variant) {
              throw new CustomError({
                message: `Varian produk tidak ditemukan untuk produk ${p.name}`,
                statusCode: 404,
              });
            }

            const priceNum = variant.salePrice ?? variant.regularPrice;
            return {
              name: `${p.name} - ${variant.name}`,
              price: String(priceNum),
              qty: ci.quantity,
              discount: '0',
            };
          }

          const priceNum = p.salePrice ?? p.price;
          if (priceNum == null || Number.isNaN(Number(priceNum))) {
            throw new CustomError({
              message: `Harga layanan ${p.name ?? '(tanpa nama)'} tidak valid`,
              statusCode: 400,
            });
          }

          return {
            name: p.name,
            price: String(priceNum),
            qty: ci.quantity,
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

    return { orderId: trackId };
  }

  async getOrderByUuid(uuid: string) {
    const order = await this.orderRepository.getThrowByUuid({
      uuid,
      select: selectOrderByUuid,
    });

    if (
      order.expiredAt &&
      order.expiredAt < new Date() &&
      order.status === TypeStatusOrder.WAITING_PAYMENT
    ) {
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

    if (
      order.expiredAt &&
      order.expiredAt < new Date() &&
      order.status === TypeStatusOrder.WAITING_PAYMENT
    ) {
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

    if (
      order?.expiredAt < new Date() &&
      order.status === TypeStatusOrder.WAITING_PAYMENT
    ) {
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
      subject: '[G-Solusi] Receipt - Your Order',
      title: 'Check Tracking',
      description:
        'Want real-time updates on your order? 📦 Click "Check Tracking", enter your Order ID, and stay informed every step of the way! 🚀',
      buttonText: 'Check Tracking',
      link: `${process.env.FRONTEND_URL}/track-order?trackingId=${order.trackId}`,
      email: order.email,
      order: {
        id: order.trackId,
        name: order.name,
        phone: order.phoneNumber,
        email: order.email,
        address: order?.recipientAddress?.address ?? 'Pickup Store',
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
      where: { id: order.id, status: TypeStatusOrder.WAITING_PAYMENT },
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
        if (
          order.expiredAt &&
          order.expiredAt < new Date() &&
          order.status === TypeStatusOrder.WAITING_PAYMENT
        ) {
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
          recipientAddress: order.recipientAddress,
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

    if (
      order.expiredAt &&
      order.expiredAt < new Date() &&
      order.status === TypeStatusOrder.WAITING_PAYMENT
    ) {
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
    const { orderUuid, status, notes, scheduledAt, spk } = dto;

    if (scheduledAt) {
      var d = new Date(scheduledAt);
      if (isNaN(d.getTime())) {
        throw new CustomError({
          message: 'scheduledAt tidak valid',
          statusCode: 400,
        });
      }
    }

    return this.prismaService.execTx(async (tx) => {
      // pastikan order ada
      await this.orderRepository.getThrowByUuid({
        uuid: orderUuid,
        select: { id: true },
        tx,
      });

      await this.orderRepository.update({
        where: { uuid: orderUuid },
        data: {
          status,
          notes,
          spk,
          scheduledAt: d,
        },
        tx,
      });

      return null;
    });
  }

  async updateOrderProductByUuid(dto: UpdateOrderProductByUuidDto) {
    const { orderUuid, items } = dto;

    if (!items?.length) {
      throw new CustomError({
        message: 'items tidak boleh kosong',
        statusCode: 400,
      });
    }

    return this.prismaService.execTx(async (tx) => {
      // Pastikan order ada & dapatkan id
      const order = await this.orderRepository.getThrowByUuid({
        uuid: orderUuid,
        select: { id: true },
        tx,
      });

      // Validasi kepemilikan orderProduct
      const requestedUuids = items.map((i) => i.orderProductUuid);
      const existing = await this.orderProductRepository.getMany({
        where: { orderId: order.id, uuid: { in: requestedUuids } },
        select: { id: true, uuid: true },
        tx,
      });

      const validSet = new Set(existing.map((e) => e.uuid));
      const invalid = requestedUuids.filter((u) => !validSet.has(u));
      if (invalid.length) {
        throw new CustomError({
          message: `orderProductUuid tidak valid / bukan milik order: ${invalid.join(
            ', ',
          )}`,
          statusCode: 400,
        });
      }

      // Proses tiap item
      for (const it of items) {
        // Resolve driver (optional)
        let driverId: number | undefined;
        let driverName: string | undefined;
        if (it.driverUuid) {
          const drv = await this.driverRepository.getThrowByUuid({
            uuid: it.driverUuid,
            select: { id: true, name: true },
            tx,
          });
          driverId = drv.id;
          driverName = drv.name ?? null;
        }

        // Resolve technicians (optional, array)
        let technicianIds: number[] | undefined;
        let technicianNames: string[] | undefined;
        if (it.technicianUuids?.length) {
          technicianIds = [];
          technicianNames = [];
          for (const tu of it.technicianUuids) {
            const tech = await this.technicianRepository.getThrowByUuid({
              uuid: tu,
              select: { id: true, name: true },
              tx,
            });
            technicianIds.push(tech.id);
            technicianNames.push(tech.name ?? null);
          }
        }

        // Build payload untuk OrderProduct
        const data: Prisma.OrderProductUpdateInput = {
          deviceId: it.deviceId ?? undefined,
          ...(driverId !== undefined ? { driverId } : {}),
          ...(driverName !== undefined ? { driverName } : {}),
          ...(technicianIds !== undefined
            ? { technicianId: technicianIds }
            : {}),
          ...(technicianNames !== undefined
            ? { technicianName: technicianNames }
            : {}),
        };

        await this.orderProductRepository.updateByUuid({
          uuid: it.orderProductUuid,
          data,
          tx,
        });
      }

      return null;
    });
  }

  async completeOrderProducts(
    dto: CompleteOrderProductsDto,
    filesByItem: Express.Multer.File[][] = [],
  ) {
    const { orderUuid, items } = dto;

    if (!items?.length) {
      throw new CustomError({
        message: 'items tidak boleh kosong',
        statusCode: 400,
      });
    }

    return this.prismaService.execTx(async (tx) => {
      // Pastikan order ada
      const order = await this.orderRepository.getThrowByUuid({
        uuid: orderUuid,
        select: { id: true },
        tx,
      });

      // Validasi kepemilikan tiap orderProduct
      const reqUuids = items.map((i) => i.orderProductUuid);
      const exist = await this.orderProductRepository.getMany({
        where: { orderId: order.id, uuid: { in: reqUuids } },
        select: { uuid: true },
        tx,
      });
      const validSet = new Set(exist.map((x) => x.uuid));
      const invalid = reqUuids.filter((u) => !validSet.has(u));
      if (invalid.length) {
        throw new CustomError({
          message: `orderProductUuid tidak valid / bukan milik order: ${invalid.join(
            ', ',
          )}`,
          statusCode: 400,
        });
      }

      // Bulk resolve teknisi & driver
      const techUniques = Array.from(
        new Set(
          items
            .flatMap((i) => i.technicianUuids ?? [])
            .filter(Boolean) as string[],
        ),
      );
      const drvUniques = Array.from(
        new Set(items.map((i) => i.driverUuid).filter(Boolean) as string[]),
      );

      let techMap = new Map<string, { id: number; name: string | null }>();
      if (techUniques.length) {
        const techs = await this.technicianRepository.getMany({
          where: { uuid: { in: techUniques } },
          select: { uuid: true, id: true, name: true },
          tx,
        });
        const found = new Set(techs.map((t) => t.uuid));
        const missing = techUniques.filter((u) => !found.has(u));
        if (missing.length) {
          throw new CustomError({
            message: `technicianUuid tidak valid: ${missing.join(', ')}`,
            statusCode: 400,
          });
        }
        techMap = new Map(
          techs.map((t) => [t.uuid, { id: t.id, name: t.name }]),
        );
      }

      let drvMap = new Map<string, { id: number; name: string | null }>();
      if (drvUniques.length) {
        const drvs = await this.driverRepository.getMany({
          where: { uuid: { in: drvUniques } },
          select: { uuid: true, id: true, name: true },
          tx,
        });
        const found = new Set(drvs.map((d) => d.uuid));
        const missing = drvUniques.filter((u) => !found.has(u));
        if (missing.length) {
          throw new CustomError({
            message: `driverUuid tidak valid: ${missing.join(', ')}`,
            statusCode: 400,
          });
        }
        drvMap = new Map(drvs.map((d) => [d.uuid, { id: d.id, name: d.name }]));
      }

      // Proses per item
      for (let i = 0; i < items.length; i++) {
        const it = items[i];

        // Images: simpan file jadi URL; index 0 = main
        const files = filesByItem[i] ?? [];
        const urls: string[] = [];
        for (const f of files) {
          urls.push(await this.saveLocalImage(f)); // implementasi sudah ada di kode lama
        }
        const imagesNested =
          urls.length || (it.replaceImages?.length ?? 0) > 0
            ? {
                ...(it.replaceImages?.length
                  ? { deleteMany: { uuid: { in: it.replaceImages } } }
                  : {}),
                ...(urls.length
                  ? {
                      create: urls.map((url, idx) => ({
                        url,
                        isMain: idx === 0,
                      })),
                    }
                  : {}),
              }
            : undefined;

        // Driver (opsional)
        let driverId: number | undefined;
        let driverName: string | null | undefined;
        if (it.driverUuid) {
          const d = drvMap.get(it.driverUuid);
          driverId = d?.id;
          driverName = d?.name ?? null;
        }

        // Teknisi (opsional; array)
        let technicianIds: number[] | undefined;
        let technicianNames: (string | null)[] | undefined;
        if (it.technicianUuids?.length) {
          technicianIds = [];
          technicianNames = [];
          for (const tu of it.technicianUuids) {
            const t = techMap.get(tu)!; // sudah tervalidasi
            technicianIds.push(t.id);
            technicianNames.push(t.name ?? null);
          }
        }

        const data: Prisma.OrderProductUpdateInput = {
          deviceId: it.deviceId ?? undefined,
          remarks: it.remarks ?? undefined,
          freonBefore: it.freonBefore ?? undefined,
          freonAfter: it.freonAfter ?? undefined,
          tempBefore: it.tempBefore ?? undefined,
          tempAfter: it.tempAfter ?? undefined,
          currentBefore: it.currentBefore ?? undefined,
          currentAfter: it.currentAfter ?? undefined,
          images: imagesNested,
          ...(driverId !== undefined ? { driverId } : {}),
          ...(driverName !== undefined ? { driverName } : {}),
          ...(technicianIds !== undefined
            ? { technicianId: technicianIds }
            : {}),
          ...(technicianNames !== undefined
            ? { technicianName: technicianNames as string[] }
            : {}),
        };

        await this.orderProductRepository.updateByUuid({
          uuid: it.orderProductUuid,
          data,
          tx,
        });
      }

      return null;
    });
  }

  async getManyDevicePaginate(sub: string, dto: DeviceListFilterDto) {
    const customer = await this.customerRepository.getThrowByUuid({
      uuid: sub,
    });
    return this.orderProductRepository.getManyDevicePaginate({
      filter: {
        ...dto,
        customerId: customer.id,
      },
    });
  }

  async getManyDeviceById(sub: string, deviceId: string) {
    let customer = null;

    if (sub) {
      customer = await this.customerRepository.getThrowByUuid({
        uuid: sub,
      });
    }
    return this.orderProductRepository.getManyDevice({
      where: {
        deviceId,
        ...(customer && { order: { customerId: customer.id } }),
      },
      select: selectOrderProductDevice,
    });
  }

  async getSummary(filter: IFilterReportSummary) {
    const balance = await this.orderRepository.aggregate({
      _sum: {
        totalPayment: true,
      },
      where: {
        status: {
          in: [
            TypeStatusOrder.ON_PROGRESS,
            TypeStatusOrder.DELIVERED,
            TypeStatusOrder.SHIPPED,
          ],
        },
        ...(filter.startDate &&
          filter.endDate && {
            createdAt: {
              gte: new Date(filter.startDate),
              lte: new Date(filter.endDate),
            },
          }),
      },
    });

    const numberOfTransaction = await this.orderRepository.count({
      where: {
        ...(filter.startDate &&
          filter.endDate && {
            createdAt: {
              gte: new Date(filter.startDate),
              lte: new Date(filter.endDate),
            },
          }),
      },
    });

    return {
      balance: balance._sum.totalPayment || 0,
      numberOfTransaction,
    };
  }

  async getTransactionStats(filter: IFilterReportTransactionStats) {
    const filterBy = filter.by || 'qty';
    const period = filter.period || 'yearly';

    const nowJakarta = luxon.DateTime.now().setZone('Asia/Jakarta');
    const year = nowJakarta.year;
    const month = nowJakarta.month;
    const day = nowJakarta.day;

    let startJakarta: luxon.DateTime;
    let endJakarta: luxon.DateTime;

    const isCustomRange = !!(filter.startDate && filter.endDate);
    if (isCustomRange) {
      startJakarta = luxon.DateTime.fromISO(filter.startDate, {
        zone: 'Asia/Jakarta',
      }).startOf('day');

      endJakarta = luxon.DateTime.fromISO(filter.endDate, {
        zone: 'Asia/Jakarta',
      }).endOf('day');
    } else {
      if (period === 'yearly') {
        startJakarta = luxon.DateTime.fromObject(
          { year, month: 1, day: 1 },
          { zone: 'Asia/Jakarta' },
        );
        endJakarta = luxon.DateTime.fromObject(
          { year, month: 12, day: 31, hour: 23, minute: 59, second: 59 },
          { zone: 'Asia/Jakarta' },
        );
      } else if (period === 'monthly') {
        startJakarta = luxon.DateTime.fromObject(
          { year, month, day: 1 },
          { zone: 'Asia/Jakarta' },
        );
        endJakarta = startJakarta
          .plus({ months: 1 })
          .minus({ milliseconds: 1 });
      } else if (period === 'weekly') {
        const currentJakarta = luxon.DateTime.fromObject(
          { year, month, day },
          { zone: 'Asia/Jakarta' },
        );
        const daysFromMonday = currentJakarta.weekday - 1;
        startJakarta = currentJakarta.minus({ days: daysFromMonday });
        endJakarta = startJakarta
          .plus({ days: 6 })
          .set({ hour: 23, minute: 59, second: 59 });
      } else if (period === 'daily') {
        startJakarta = luxon.DateTime.fromObject(
          { year, month, day },
          { zone: 'Asia/Jakarta' },
        );
        endJakarta = startJakarta.set({ hour: 23, minute: 59, second: 59 });
      } else {
        throw new Error(`Invalid period: ${period}`);
      }
    }

    const startDate = startJakarta.toJSDate();
    const endDate = endJakarta.toJSDate();

    const groupedData = await this.orderRepository.groupBy({
      by: ['createdAt'],
      ...(filterBy === 'qty'
        ? { _count: { id: true } }
        : { _sum: { totalPayment: true } }),
      where: {
        status: {
          in: [
            TypeStatusOrder.ON_PROGRESS,
            TypeStatusOrder.DELIVERED,
            TypeStatusOrder.SHIPPED,
          ],
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // =========================
    //  CUSTOM RANGE HANDLER
    // =========================
    if (isCustomRange) {
      const dailyData = {};

      // Loop dari startDate → endDate
      let cursor = startJakarta;
      while (cursor <= endJakarta) {
        const dateStr = cursor.toFormat('yyyy-MM-dd');
        dailyData[dateStr] = 0;
        cursor = cursor.plus({ days: 1 });
      }

      // Masukkan hasil dari DB
      groupedData.forEach((item) => {
        const jakartaDate = luxon.DateTime.fromJSDate(
          new Date(item.createdAt),
        ).setZone('Asia/Jakarta');

        const dateKey = jakartaDate.toFormat('yyyy-MM-dd');
        if (dailyData.hasOwnProperty(dateKey)) {
          if (item._sum?.totalPayment) {
            dailyData[dateKey] += item._sum.totalPayment;
          } else if (item._count?.id) {
            dailyData[dateKey] += item._count.id;
          }
        }
      });

      return dailyData;
    }

    // =========================
    // PERIOD HANDLER
    // =========================
    if (period === 'yearly') {
      const monthlyData = {};
      const months = getMonth();

      months.forEach((m) => (monthlyData[m] = 0));

      groupedData.forEach((item) => {
        const date = luxon.DateTime.fromJSDate(item.createdAt).setZone(
          'Asia/Jakarta',
        );
        const monthName = getMonth()[date.month - 1];

        if (item._sum?.totalPayment)
          monthlyData[monthName] += item._sum.totalPayment;
        else if (item._count?.id) monthlyData[monthName] += item._count.id;
      });

      return monthlyData;
    }

    if (period === 'monthly') {
      const dailyData = {};
      const daysInMonth = luxon.DateTime.fromObject(
        { year, month },
        { zone: 'Asia/Jakarta' },
      ).daysInMonth;

      for (let d = 1; d <= daysInMonth; d++) dailyData[d] = 0;

      groupedData.forEach((item) => {
        const date = luxon.DateTime.fromJSDate(item.createdAt).setZone(
          'Asia/Jakarta',
        );
        const dayOfMonth = date.day;
        if (item._sum?.totalPayment)
          dailyData[dayOfMonth] += item._sum.totalPayment;
        else if (item._count?.id) dailyData[dayOfMonth] += item._count.id;
      });

      return dailyData;
    }

    if (period === 'weekly') {
      const weeklyData = {};
      const dayNames = getDay();
      dayNames.forEach((d) => (weeklyData[d] = 0));

      groupedData.forEach((item) => {
        const date = luxon.DateTime.fromJSDate(item.createdAt).setZone(
          'Asia/Jakarta',
        );
        const dayName = dayNames[date.weekday - 1];
        if (item._sum?.totalPayment)
          weeklyData[dayName] += item._sum.totalPayment;
        else if (item._count?.id) weeklyData[dayName] += item._count.id;
      });

      return weeklyData;
    }

    if (period === 'daily') {
      const hourlyData = {};
      for (let hour = 0; hour < 24; hour++) {
        const hourKey = hour.toString().padStart(2, '0');
        hourlyData[hourKey] = 0;
      }

      groupedData.forEach((item) => {
        const date = luxon.DateTime.fromJSDate(item.createdAt).setZone(
          'Asia/Jakarta',
        );
        const hourKey = date.hour.toString().padStart(2, '0');
        if (item._sum?.totalPayment)
          hourlyData[hourKey] += item._sum.totalPayment;
        else if (item._count?.id) hourlyData[hourKey] += item._count.id;
      });

      return hourlyData;
    }
  }

  private async saveLocalImage(file: Express.Multer.File) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = genSlug((file.originalname || '').replace(ext, ''));
    const fileName = `${genIdPrefixTimestamp(base)}${ext || ''}`;
    const dir = path.join(
      process.cwd(),
      'public',
      'upload',
      'order',
      'complete',
    );
    await fs.mkdir(dir, { recursive: true });
    const abs = path.join(dir, fileName);
    const buf =
      file.buffer ?? (file.path ? await fs.readFile(file.path) : null);
    if (!buf) throw new Error('File kosong');
    await fs.writeFile(abs, buf);
    return `/upload/order/complete/${fileName}`;
  }
}
