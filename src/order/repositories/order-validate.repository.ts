import { Injectable } from '@nestjs/common';
import { CustomError } from 'helpers/http.helper';
import { AuthService } from 'src/auth/auth.service';
import { CreateOrderDto } from '../dto/order.dto';
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
      productUuid: string;
      productVariantUuid: string;
      quantity: number;
    }[],
    products: (Product & { productVariant: ProductVariant[] })[],
  ) {
    const validatedItems = [];

    for (const cart of carts) {
      const product = products.find((p) => p.uuid === cart.productUuid);

      if (!product) {
        throw new CustomError({
          message: `Produk dengan UUID ${cart.productUuid} tidak ditemukan`,
          statusCode: 404,
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

      if (variant.stock < cart.quantity) {
        throw new CustomError({
          message: `Stok varian ${variant.name} tidak mencukupi`,
          statusCode: 400,
        });
      }

      validatedItems.push({
        product,
        variant,
        quantity: cart.quantity,
      });
    }

    return validatedItems;
  }
}
