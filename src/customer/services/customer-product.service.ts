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
import { ISelectGeneralBundle } from '../interfaces/customer-product.interface';
import { Prisma, ProductVariant } from '@prisma/client';

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

    const isBundleDto = !!dto.bundleUuid;
    const lookupUuid = isBundleDto ? dto.bundleUuid! : dto.productUuid;

    let entity = await this.productRepository.getThrowProductOrBundleByUuid({
      uuid: lookupUuid,
      selectProduct: selectProductForCreateCustomerProduct,
      selectBundle: selectGenerealBundle,
    });

    const isBundleEntity = (e: any) =>
      !!e && (e.recordType === 'BUNDLE' || 'items' in e || 'bundleImage' in e);
    const isProductEntity = (e: any) => !!e && !isBundleEntity(e);

    // ===================== PRODUCT FLOW =====================
    if (!isBundleDto || isProductEntity(entity)) {
      if (!dto.productUuid) {
        throw new CustomError({
          message: 'Product UUID wajib diisi untuk item produk',
          statusCode: 400,
        });
      }
      let productVariant: ProductVariant;
      if (dto.productVariantUuid) {
        productVariant = await this.productVariantRepository.getThrowByUuid({
          uuid: dto.productVariantUuid,
        });
        if (Number(productVariant.stock ?? 0) < dto.quantity) {
          throw new CustomError({
            message: 'Stok tidak mencukupi',
            statusCode: 400,
          });
        }

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
      }

      return await this.customerProductRepository.create({
        data: {
          customer: { connect: { id: customer.id } },
          product: { connect: { id: entity.id } },
          ...(productVariant && {
            productVariant: { connect: { id: productVariant.id } },
          }),
          quantity: dto.quantity,
          deviceId: dto.deviceId,
        },
      });
    }

    // ===================== BUNDLE FLOW =====================
    if (isBundleDto || isBundleEntity(entity)) {
      const bundle = entity as ISelectGeneralBundle;

      // 1) Cek duplikasi bundle di cart
      const dup = await this.customerProductRepository.getMany({
        where: { customerId: customer.id, bundleId: entity.id },
      });
      if (dup.length) {
        throw new CustomError({
          message: 'Bundle sudah ada di keranjang',
          statusCode: 400,
        });
      }

      // 2) VALIDASI produk & varian di dalam bundle
      const productsInDto = dto.productBundles ?? [];
      const bundleItems = Array.isArray(bundle.items) ? bundle.items : [];

      const bundleProductMap = new Map<string, any>(
        bundleItems
          .filter((bi: any) => bi?.product?.uuid)
          .map((bi: any) => [bi.product.uuid as string, bi.product]),
      );

      const hasAnyVariant = bundleItems.some(
        (bi: any) => (bi?.product?.productVariant?.length ?? 0) > 0,
      );
      if (hasAnyVariant && productsInDto.length === 0) {
        throw new CustomError({
          message:
            'Bundle ini memiliki produk dengan varian. Sertakan "products" dengan { uuid, variantUuid } untuk setiap produk bervarian.',
          statusCode: 400,
        });
      }

      const seen = new Set<string>();
      const createCustomerProductBundle: Prisma.CustomerProductBundleCreateWithoutCustomerProductInput[] =
        [];
      for (const p of productsInDto) {
        if (!p?.uuid) {
          throw new CustomError({
            message: 'Produk dalam bundle wajib memiliki uuid',
            statusCode: 400,
          });
        }
        if (seen.has(p.uuid)) {
          throw new CustomError({
            message: `Produk ${p.uuid} terduplikasi dalam payload bundle`,
            statusCode: 400,
          });
        }
        seen.add(p.uuid);

        const baseProduct = bundleProductMap.get(p.uuid);
        if (!baseProduct) {
          throw new CustomError({
            message: `Produk ${p.uuid} tidak termasuk dalam bundle ini`,
            statusCode: 400,
          });
        }

        const variants = Array.isArray(baseProduct.productVariant)
          ? baseProduct.productVariant
          : [];

        if (variants.length > 0) {
          if (!p.variantUuid) {
            throw new CustomError({
              message: `Varian wajib dipilih untuk produk ${baseProduct.name} di dalam bundle`,
              statusCode: 400,
            });
          }

          const variant = variants.find((v: any) => v.uuid === p.variantUuid);
          if (!variant) {
            throw new CustomError({
              message: `Varian ${p.variantUuid} tidak ditemukan untuk produk ${baseProduct.name}`,
              statusCode: 404,
            });
          }

          const needQty = Number(dto.quantity ?? 1);
          const stock = Number(variant.stock ?? Infinity);
          if (isFinite(stock) && stock < needQty) {
            throw new CustomError({
              message: `Stok varian ${variant.name} pada produk ${baseProduct.name} tidak mencukupi`,
              statusCode: 400,
            });
          }
        } else {
          if (p.variantUuid) {
            throw new CustomError({
              message: `Produk ${baseProduct.name} tidak memiliki varian, jangan kirim variantUuid`,
              statusCode: 400,
            });
          }
        }

        createCustomerProductBundle.push({
          product: { connect: { uuid: p.uuid } },
          ...(p.variantUuid && {
            productVariant: { connect: { uuid: p.variantUuid } },
            ...(p.deviceId && { deviceId: p.deviceId }),
          }),
        });
      }

      // 3) Lolos semua validasi → create cart item bundle
      return await this.customerProductRepository.create({
        data: {
          customer: { connect: { id: customer.id } },
          bundle: { connect: { id: bundle.id } },
          customerProductBundle: { create: createCustomerProductBundle },
          quantity: dto.quantity,
          deviceId: dto.deviceId,
        },
      });
    }
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
