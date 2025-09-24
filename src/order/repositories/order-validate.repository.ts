import { Injectable } from '@nestjs/common';
import { CustomError } from 'helpers/http.helper';
import { AuthService } from 'src/auth/auth.service';
import { CartItemDto, CreateOrderDto } from '../dto/order.dto';
import { Product, ProductVariant, TypeStatusOrder } from '@prisma/client';
import { IOrderDeliveryService } from '../interfaces/order-delivery-service.interface';
import { ISelectProductForCreateOrder } from '../interfaces/order.interface';
import { GatewayService } from 'src/gateway/services/gateway.service';

@Injectable()
export class OrderValidateRepository {
  constructor(
    private readonly authService: AuthService,
    private readonly gatewayService: GatewayService,
  ) {}

  /*
    |--------------------------------------------------------------------------
    | Order Validate Repository
    |--------------------------------------------------------------------------
    */

  async validateIsMembership(authorization: string) {
    let customer: string | null = null;

    if (authorization) {
      try {
        const decoded = await this.authService.verifyJwtToken(authorization);
        customer = decoded?.sub || null;
      } catch (error) {
        customer = null;
      }
    }

    return customer;
  }

  private validateProductExists(product: Product | undefined): void {
    if (!product) {
      throw new CustomError({
        message: 'Produk tidak ditemukan',
        statusCode: 404,
      });
    }
  }

  private validateProductSalesExists(product: any, salesUuid: string): void {
    const hasValidSales = product.productSales?.some(
      (sales) => sales.uuid === salesUuid,
    );

    if (!hasValidSales) {
      throw new CustomError({
        message: 'Produk sales tidak ditemukan',
        statusCode: 404,
      });
    }
  }

  async validateProducts(
    carts: CreateOrderDto['carts'],
    products: ISelectProductForCreateOrder[],
  ) {
    const productMap = new Map(products.map((p) => [p.uuid, p]));

    for (const cartItem of carts) {
      const product = productMap.get(cartItem.productUuid);
      this.validateProductExists(product);

      const stockResponse = 100;

      const stockAvailable = Number(stockResponse);
      if (cartItem.quantity > stockAvailable) {
        throw new CustomError({
          message: 'Stok produk habis',
          statusCode: 400,
        });
      }
    }
  }

  validatePaymentMethod(
    isVa: boolean,
    isEwallet: boolean,
    isQrCode: boolean,
    isPaylater: boolean,
    isRetailOutlet: boolean,
  ): void {
    if (!isVa && !isEwallet && !isQrCode && !isPaylater && !isRetailOutlet) {
      throw new CustomError({
        message: 'Metode pembayaran tidak valid',
        statusCode: 400,
      });
    }
  }

  validateSubTotalPay(subTotalPay: number, subTotalPayDto: number) {
    if (subTotalPay !== subTotalPayDto) {
      console.log(`expected: ${subTotalPay}, actual: ${subTotalPayDto}`);
      throw new CustomError({
        message: 'Subtotal tidak valid',
        statusCode: 400,
      });
    }
  }

  validateVoucherDiscount(voucherDiscount: number, voucherDiscountDto: number) {
    if (voucherDiscount !== voucherDiscountDto) {
      throw new CustomError({
        message: 'Diskon voucher tidak valid',
        statusCode: 400,
      });
    }
  }

  validateAllowedDeliveryService(dto: CreateOrderDto) {
    const allowed = ['JNE', 'JNT', 'NINJA EXPRESS', 'SAP', 'SICEPAT'];

    if (!allowed.includes(dto.deliveryService)) {
      throw new CustomError({
        message: 'Layanan pengiriman tidak valid',
        statusCode: 400,
      });
    }
  }

  validateTotalPayment(totalPayment: number, totalPaymentDto: number) {
    if (totalPayment !== totalPaymentDto) {
      console.log(`expected: ${totalPayment}, actual: ${totalPaymentDto}`);
      throw new CustomError({
        message: 'Total pembayaran tidak valid',
        statusCode: 400,
      });
    }
  }

  validateCancelOrderExpired(expiredAt: Date) {
    if (new Date() > expiredAt) {
      throw new CustomError({
        message: 'Tidak dapat membatalkan pesanan.',
        statusCode: 400,
      });
    }
  }

  validateCancelOrderStatus(status: TypeStatusOrder) {
    if (status !== TypeStatusOrder.WAITING_PAYMENT) {
      throw new CustomError({
        message: 'Tidak dapat membatalkan pesanan.',
        statusCode: 400,
      });
    }
  }

  async validateProductsWithVariants(
    carts: {
      productUuid?: string;
      productVariantUuid?: string;
      quantity: number;
      type?: 'PRODUCT' | 'BUNDLE';
    }[],
    products: (Product & {
      productVariant: ProductVariant[];
      _originalBundle?: any;
    })[],
  ) {
    const validatedItems: {
      product: Product;
      variant?: ProductVariant | null;
      quantity: number;
      type: 'PRODUCT' | 'BUNDLE' | 'SERVICE';
    }[] = [];

    for (const cart of carts) {
      const kind: 'PRODUCT' | 'BUNDLE' | 'SERVICE' =
        (cart.type as any) || (cart.productVariantUuid ? 'PRODUCT' : 'SERVICE');

      const bundleUuid = (cart as any).bundleUuid as string | undefined;
      const idToFind = kind === 'BUNDLE' ? bundleUuid : cart.productUuid;

      const product = products.find((p) => p.uuid === idToFind);

      if (!product) {
        const label =
          kind === 'BUNDLE'
            ? 'Bundle'
            : kind === 'PRODUCT'
            ? 'Produk'
            : 'Layanan';
        throw new CustomError({
          message: `${label} dengan UUID ${
            idToFind ?? '(kosong)'
          } tidak ditemukan`,
          statusCode: 404,
        });
      }

      if (kind === 'PRODUCT') {
        if (!cart.productVariantUuid) {
          throw new CustomError({
            message: `Varian wajib dipilih untuk produk ${product.name}`,
            statusCode: 400,
          });
        }

        const variant = product.productVariant.find(
          (v) => v.uuid === cart.productVariantUuid,
        );

        if (!variant) {
          throw new CustomError({
            message: `Varian produk tidak ditemukan untuk produk ${product.name}`,
            statusCode: 404,
          });
        }

        if (Number(variant.stock ?? 0) < cart.quantity) {
          throw new CustomError({
            message: `Stok varian ${variant.name} tidak mencukupi`,
            statusCode: 400,
          });
        }

        validatedItems.push({
          product,
          variant,
          quantity: cart.quantity,
          type: 'PRODUCT',
        });
        continue;
      }

      if (kind === 'BUNDLE') {
        if (cart.productVariantUuid) {
          throw new CustomError({
            message: `Bundle tidak memerlukan varian`,
            statusCode: 400,
          });
        }

        const bundle = (product as any)._originalBundle;
        if (bundle?.items?.length) {
          for (const item of bundle.items) {
            const p = item.product;
            const name = p?.name ?? '(produk bundle)';
            const stock = Number(p?.stock ?? Infinity);
            if (isFinite(stock) && stock < cart.quantity) {
              throw new CustomError({
                message: `Stok produk ${name} dalam bundle tidak mencukupi`,
                statusCode: 400,
              });
            }
          }
        }

        validatedItems.push({
          product,
          variant: null,
          quantity: cart.quantity,
          type: 'BUNDLE',
        });
        continue;
      }

      validatedItems.push({
        product,
        variant: null,
        quantity: cart.quantity,
        type: 'SERVICE',
      });
    }

    return validatedItems;
  }

  // Alternative approach: Create separate validation functions and call them conditionally
  // async validateUnifiedItems(
  //   carts: CartItemDto[],
  //   products: any[],
  //   bundles: any[],
  // ) {
  //   const productCarts = carts.filter((c) => c.type === 'PRODUCT');
  //   const bundleCarts = carts.filter((c) => c.type === 'BUNDLE');

  //   // Validate products using existing function
  //   if (productCarts.length > 0) {
  //     const transformedProductCarts = productCarts.map((cart) => ({
  //       productUuid: cart.productUuid,
  //       productVariantUuid: cart.productVariantUuid,
  //       quantity: cart.quantity,
  //     }));

  //     await this.validateProductsWithVariants(
  //       transformedProductCarts,
  //       products,
  //     );
  //   }

  //   // Validate bundles using new function
  //   if (bundleCarts.length > 0) {
  //     await this.validateBundles(bundleCarts, bundles);
  //   }
  // }

  // New bundle validation function
  // async validateBundles(
  //   carts: {
  //     bundleUuid?: string;
  //     quantity: number;
  //   }[],
  //   bundles: any[],
  // ) {
  //   for (const cart of carts) {
  //     const bundle = bundles.find((b) => b.uuid === cart?.bundleUuid);

  //     if (!bundle) {
  //       throw new CustomError({
  //         message: `Bundle dengan UUID ${cart.bundleUuid} tidak ditemukan`,
  //         statusCode: 404,
  //       });
  //     }

  //     // Validate bundle is active
  //     if (!bundle.isActive) {
  //       throw new CustomError({
  //         message: `Bundle ${bundle.name} tidak aktif`,
  //         statusCode: 400,
  //       });
  //     }

  //     // Optional: Validate stock for products in the bundle
  //     if (bundle.items) {
  //       for (const bundleItem of bundle.items) {
  //         if (
  //           bundleItem.product.stock &&
  //           bundleItem.product.stock < cart.quantity
  //         ) {
  //           throw new CustomError({
  //             message: `Stok produk ${bundleItem.product.name} dalam bundle ${bundle.name} tidak mencukupi`,
  //             statusCode: 400,
  //           });
  //         }
  //       }
  //     }
  //   }
  // }
}
