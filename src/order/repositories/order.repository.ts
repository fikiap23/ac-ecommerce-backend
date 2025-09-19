import { Injectable } from '@nestjs/common';
import {
  Prisma,
  TypeStatusOrder,
  TypeStatusVoucher,
  TypeVoucher,
} from '@prisma/client';
import { OrderQuery } from 'src/prisma/queries/order/order.query';
import { ICreateOrder, IFilterOrder } from '../interfaces/order.interface';
import { CustomError } from 'helpers/http.helper';
import { CreateOrderDto } from '../dto/order.dto';
import { ISelectVoucherForCalculate } from 'src/voucher/interfaces/voucher.interface';
import { ISelectProductForCreateOrder } from 'src/product/interfaces/product.interface';
import { whereOrderGetManyPaginate } from 'src/prisma/queries/order/props/where-order.prop';
import { IOrderDeliveryService } from '../interfaces/order-delivery-service.interface';

@Injectable()
export class OrderRepository {
  constructor(private readonly orderQuery: OrderQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Order Repository
    |--------------------------------------------------------------------------
    */

  async calculateTotalAmount(
    carts: CreateOrderDto['carts'],
    products: (ISelectProductForCreateOrder & {
      productVariant: {
        uuid: string;
        salePrice: number | null;
        regularPrice: number;
      }[];
    })[],
  ): Promise<number> {
    const productMap = new Map(products.map((p) => [p.uuid, p]));
    let totalAmount = 0;

    for (const cartItem of carts) {
      const product = productMap.get(cartItem.productUuid);

      if (!product) {
        throw new CustomError({
          message: `Produk dengan UUID ${cartItem.productUuid} tidak ditemukan`,
          statusCode: 404,
        });
      }

      const isProductType = product.serviceType === 'PRODUCT';

      if (isProductType) {
        // Wajib ada variant utk PRODUCT
        if (!cartItem.productVariantUuid) {
          throw new CustomError({
            message: `Varian wajib dipilih untuk produk ${product.name}`,
            statusCode: 400,
          });
        }

        const variant = product.productVariant.find(
          (v) => v.uuid === cartItem.productVariantUuid,
        );

        if (!variant) {
          throw new CustomError({
            message: `Varian produk tidak ditemukan untuk produk ${product.name}`,
            statusCode: 404,
          });
        }

        const priceToUse = variant.salePrice ?? variant.regularPrice;

        if (priceToUse == null || Number.isNaN(Number(priceToUse))) {
          throw new CustomError({
            message: `Harga varian ${product.name} tidak valid`,
            statusCode: 400,
          });
        }

        totalAmount += Number(priceToUse) * cartItem.quantity;
      } else {
        const priceToUse = product.salePrice ?? product.price;

        if (priceToUse == null || Number.isNaN(Number(priceToUse))) {
          throw new CustomError({
            message: `Harga produk layanan ${product.name} tidak valid`,
            statusCode: 400,
          });
        }

        totalAmount += Number(priceToUse) * cartItem.quantity;
      }
    }

    return totalAmount;
  }

  async calculateVoucher({
    voucher,
    customerId,
    carts,
    products,
    subTotalPay,
  }: {
    voucher: ISelectVoucherForCalculate;
    customerId: number;
    carts: CreateOrderDto['carts'];
    products: ISelectProductForCreateOrder[];
    subTotalPay: number;
  }) {
    let discountAmount = 0;

    // Periksa apakah voucher masih dalam masa berlaku
    if (voucher.status !== TypeStatusVoucher.ON_GOING) {
      throw new CustomError({
        message: 'Voucher tidak valid',
        statusCode: 409,
      });
    }

    // Periksa apakah kuota voucher masih tersedia
    if (voucher.quota !== null && voucher.quota <= 0) {
      throw new CustomError({
        message: 'Voucher habis',
        statusCode: 409,
      });
    }

    // Cek limit penggunaan per user jika tersedia
    if (voucher.claimLimitPerUser !== null) {
      const order = await this.getMany({
        where: {
          customerId,
          voucherId: voucher.id,
        },
      });

      if (order.length >= voucher.claimLimitPerUser) {
        throw new CustomError({
          message:
            'Voucher tidak dapat digunakan karena sudah pernah digunakan sebelumnya',
          statusCode: 409,
        });
      }
    }

    // ==== Cek apakah voucher berlaku pada produk tertentu ====
    const validProductIds = voucher.productVoucher.map(
      (pv) => (pv as any).product.uuid,
    );

    // Jika voucher berlaku untuk produk tertentu, pastikan produk tersebut ada di keranjang
    const isProductVoucher = validProductIds.length > 0;
    if (isProductVoucher) {
      const cartProductUuids = products.map((p) => p.uuid);
      const match = validProductIds.every((id) =>
        cartProductUuids.includes(id),
      );
      if (!match) {
        throw new CustomError({
          message: 'Voucher tidak memenuhi syarat produk yang dibeli',
          statusCode: 409,
        });
      }
    }

    // Hitung total belanja dari produk yang termasuk dalam voucher
    let applicableAmount = 0;
    for (const cart of carts) {
      const matchedProduct = products.find((p) => p.uuid === cart.productUuid);
      if (matchedProduct && validProductIds.includes(matchedProduct.uuid)) {
        applicableAmount += matchedProduct.price * cart.quantity;
      }
    }

    // ==== Cek minimum pembelian (untuk semua atau produk tertentu) ====
    const amount = isProductVoucher ? applicableAmount : subTotalPay;
    if (voucher.minimumAmount !== null && amount < voucher.minimumAmount) {
      throw new CustomError({
        message:
          'Voucher ini berlaku untuk pembelian dengan jumlah minimum tertentu',
        statusCode: 409,
      });
    }

    // ==== Hitung diskon berdasarkan tipe voucher ====
    if (voucher.type === TypeVoucher.FIXED) {
      if (voucher.discountAmount > amount) {
        discountAmount = amount;
      } else {
        discountAmount = voucher.discountAmount;
      }
    } else if (voucher.type === TypeVoucher.PERCENTAGE) {
      discountAmount = Math.floor(amount * (voucher.discountAmount / 100));
      if (
        voucher.maxDiscount !== null &&
        voucher.maxDiscount > 0 &&
        discountAmount > voucher.maxDiscount
      ) {
        discountAmount = voucher.maxDiscount;
      }
    }

    return discountAmount;
  }

  genTrackId(length: number) {
    let result = 'TRX-';
    const characters = '0123456789';
    const charactersLength = characters.length;

    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }

    return result;
  }

  formatOrderStatus(status: keyof typeof TypeStatusOrder): string {
    const statusMap: Record<keyof typeof TypeStatusOrder, string> = {
      WAITING_PAYMENT: 'Menunggu Pembayaran',
      CANCELLED: 'Dibatalkan',
      ON_PROGRESS: 'Sedang Diproses',
      PACKED: 'Dikemas',
      SHIPPED: 'Dikirim',
      DELIVERED: 'Diterima',
    };

    return statusMap[status] || 'Status Tidak Dikenal';
  }

  async create({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateOrder;
    select?: Prisma.OrderSelect;
  }) {
    return await this.orderQuery.create({
      tx,
      data,
      select,
    });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderWhereInput;
    select?: Prisma.OrderSelect;
  }) {
    return await this.orderQuery.findMany({
      tx,
      where,
      select,
    });
  }

  async getManyPaginate({
    tx,
    filter,
    where: additionalWhere,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterOrder;
    where?: Prisma.OrderWhereInput;
    select?: Prisma.OrderSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereOrderGetManyPaginate(filter);

    const combinedWhere: Prisma.OrderWhereInput = {
      AND: [where, additionalWhere].filter(Boolean),
    };

    return await this.orderQuery.findManyPaginate({
      tx,
      where: combinedWhere,
      select,
      orderBy: { createdAt: sort },
      page,
      limit,
    });
  }

  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.OrderSelect;
  }) {
    const result = await this.orderQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Order Tidak Ditemukan!',
        statusCode: 404,
      });
    }
    return result;
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.OrderSelect;
  }) {
    const result = await this.orderQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Order Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByUuidAndCustomerId({
    tx,
    uuid,
    customerId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    customerId: number;
    select?: Prisma.OrderSelect;
  }) {
    const result = await this.orderQuery.findByUuidAndCustomerId({
      tx,
      uuid,
      customerId,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Order Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByTrackId({
    tx,
    trackId,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    trackId: string;
    select?: Prisma.OrderSelect;
  }) {
    const result = await this.orderQuery.findByTrackId({
      tx,
      trackId,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Order Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByTrackIdAndStatus({
    tx,
    trackId,
    status,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    trackId: string;
    status: TypeStatusOrder;
    select?: Prisma.OrderSelect;
  }) {
    const result = await this.orderQuery.findByTrackIdAndStatus({
      tx,
      trackId,
      status,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Order Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async update({
    tx,
    where,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    where: Prisma.OrderWhereUniqueInput;
    data: Prisma.OrderUpdateInput;
  }) {
    return await this.orderQuery.update({ tx, where, data });
  }

  async count({
    tx,
    where,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderWhereInput;
  }) {
    return await this.orderQuery.count({ tx, where });
  }

  async aggregate({
    tx,
    where,
    _sum,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.OrderWhereInput;
    _sum?: Prisma.OrderSumAggregateInputType;
  }) {
    return await this.orderQuery.aggregate({ tx, where, _sum });
  }

  async groupBy({
    tx,
    by,
    _count,
    where,
    _sum,
  }: {
    tx?: Prisma.TransactionClient;
    by: Prisma.OrderScalarFieldEnum[];
    _count?: Prisma.OrderCountAggregateInputType;
    where?: Prisma.OrderWhereInput;
    _sum?: Prisma.OrderSumAggregateInputType;
  }) {
    return await this.orderQuery.groupBy({ tx, by, _count, where, _sum });
  }
}
