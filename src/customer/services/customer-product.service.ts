import { Injectable } from '@nestjs/common';
import { CustomerProductRepository } from '../repositories/customer-product.repository';
import {
  CreateCustomerProductDto,
  UpdateCustomerProductDto,
} from '../dto/customer-product.dto';
import { CustomerRepository } from '../repositories/customer.repository';
import { ProductRepository } from 'src/product/repositories/product.repository';
import { CustomError } from 'helpers/http.helper';
import {
  selectGenerealBundle,
  selectProductForCreateCustomerProduct,
} from 'src/prisma/queries/product/props/select-product.prop';
import {
  selectCustomerProduct,
  selectCustomerProductForUpdate,
} from 'src/prisma/queries/customer/props/select-customer-product.prop';
import { ProductVariantRepository } from 'src/product/repositories/product-variant.repository';
import { ProductVariant } from '@prisma/client';

@Injectable()
export class CustomerProductService {
  constructor(
    private readonly customerProductRepository: CustomerProductRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async create(sub: string, dto: CreateCustomerProductDto) {
    const customer = await this.customerRepository.getThrowByUuid({
      uuid: sub,
    });

    const entity = await this.productRepository.getThrowProductOrBundleByUuid({
      uuid: dto.productUuid,
      selectProduct: selectProductForCreateCustomerProduct,
      selectBundle: selectGenerealBundle,
    });

    const isBundleEntity = (e: any) =>
      !!e && (e.recordType === 'BUNDLE' || 'items' in e || 'bundleImage' in e);
    const isProductEntity = (e: any) => !!e && !isBundleEntity(e); // sisanya anggap product

    const forceProductByDto = !!dto.productVariantUuid;

    // ==== PRODUCT FLOW ====
    if (forceProductByDto || isProductEntity(entity)) {
      if (!dto.productVariantUuid) {
        throw new CustomError({
          message: 'Product variant wajib diisi',
          statusCode: 400,
        });
      }

      const productVariant = await this.productVariantRepository.getThrowByUuid(
        {
          uuid: dto.productVariantUuid,
        },
      );

      if (Number(productVariant.stock ?? 0) < dto.quantity) {
        throw new CustomError({
          message: 'Stok tidak mencukupi',
          statusCode: 400,
        });
      }

      // Cek duplikasi di cart: product + variant sama
      const dup = await this.customerProductRepository.getMany({
        where: {
          customerId: customer.id,
          productId: entity.id,
          productVariantId: productVariant.id,
        },
      });
      if (dup.length) {
        throw new CustomError({
          message: 'Produk sudah ada di keranjang',
          statusCode: 400,
        });
      }

      return await this.customerProductRepository.create({
        data: {
          customer: { connect: { id: customer.id } },
          product: { connect: { id: entity.id } },
          productVariant: { connect: { id: productVariant.id } },
          quantity: dto.quantity,
          deviceId: dto.deviceId,
        },
      });
    }

    // ==== BUNDLE FLOW ====
    if (isBundleEntity(entity)) {
      const dup = await this.customerProductRepository.getMany({
        where: {
          customerId: customer.id,
          bundleId: entity.id,
        },
      });
      if (dup.length) {
        throw new CustomError({
          message: 'Bundle sudah ada di keranjang',
          statusCode: 400,
        });
      }

      return await this.customerProductRepository.create({
        data: {
          customer: { connect: { id: customer.id } },
          bundle: { connect: { id: entity.id } },
          quantity: dto.quantity,
          deviceId: dto.deviceId,
        },
      });
    }

    // Fallback tak dikenal
    throw new CustomError({
      message: 'Item tidak dikenali (bukan product atau bundle)',
      statusCode: 400,
    });
  }

  async getMany(sub: string) {
    return await this.customerProductRepository.getMany({
      where: {
        customer: {
          uuid: sub,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: selectCustomerProduct,
    });
  }

  async updateByUuid(uuid: string, sub: string, dto: UpdateCustomerProductDto) {
    const customerProduct = await this.customerProductRepository.findOne({
      where: {
        uuid,
        customer: {
          uuid: sub,
        },
      },
      select: selectCustomerProductForUpdate,
    });
    if (!customerProduct.productVariantId) {
      throw new CustomError({
        message: 'Produk tidak memiliki variant yang valid',
        statusCode: 400,
      });
    }

    const productVariant = await this.productVariantRepository.getThrowById({
      id: customerProduct.productVariantId,
    });

    if (Number(productVariant.stock) < dto.quantity) {
      throw new CustomError({
        message: 'Stok tidak mencukupi',
        statusCode: 400,
      });
    }

    if (customerProduct?.productVariantId) {
      if (dto.productVariantUuid) {
        const productVariant =
          await this.productVariantRepository.getThrowByUuidAndProductId({
            uuid: dto.productVariantUuid,
            productId: customerProduct.productId,
          });

        const stock = productVariant.stock;

        if (Number(stock) < dto.quantity) {
          throw new CustomError({
            message: 'Stok tidak mencukupi',
            statusCode: 400,
          });
        }
      } else {
        const stock = productVariant.stock;

        if (Number(stock) < dto.quantity) {
          throw new CustomError({
            message: 'Stok tidak mencukupi',
            statusCode: 400,
          });
        }
      }
    }

    return await this.customerProductRepository.updateByUuid({
      uuid,
      data: {
        quantity: dto.quantity,
        deviceId: dto.deviceId,
        ...(dto.productVariantUuid && {
          productVariant: {
            connect: {
              uuid: dto.productVariantUuid,
            },
          },
        }),
      },
    });
  }

  async deleteByUuid(uuid: string) {
    await this.customerProductRepository.getThrowByUuid({ uuid });
    return await this.customerProductRepository.deleteByUuid({ uuid });
  }

  async getThrowByUuid(uuid: string) {
    return await this.customerProductRepository.getThrowByUuid({
      uuid,
      select: selectCustomerProduct,
    });
  }
}
