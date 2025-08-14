import { Injectable } from '@nestjs/common';
import { CustomerProductRepository } from '../repositories/customer-product.repository';
import {
  CreateCustomerProductDto,
  UpdateCustomerProductDto,
} from '../dto/customer-product.dto';
import { CustomerRepository } from '../repositories/customer.repository';
import { ProductRepository } from 'src/product/repositories/product.repository';
import { CustomError } from 'helpers/http.helper';
import { selectProductForCreateCustomerProduct } from 'src/prisma/queries/product/props/select-product.prop';
import {
  selectCustomerProduct,
  selectCustomerProductForUpdate,
} from 'src/prisma/queries/customer/props/select-customer-product.prop';

@Injectable()
export class CustomerProductService {
  constructor(
    private readonly customerProductRepository: CustomerProductRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(sub: string, dto: CreateCustomerProductDto) {
    const customer = await this.customerRepository.getThrowByUuid({
      uuid: sub,
    });
    const product = await this.productRepository.getThrowByUuid({
      uuid: dto.productUuid,
      select: selectProductForCreateCustomerProduct,
    });

    if (product && product.stock < dto.quantity) {
      throw new CustomError({
        message: 'Stok tidak mencukupi',
        statusCode: 400,
      });
    }
    const isInCart = await this.customerProductRepository.getMany({
      where: {
        customerId: customer.id,
        productId: product.id,
      },
    });

    if (isInCart.length) {
      throw new CustomError({
        message: 'Produk sudah ada di keranjang',
        statusCode: 400,
      });
    }

    return await this.customerProductRepository.create({
      data: {
        customer: {
          connect: {
            id: customer.id,
          },
        },
        quantity: dto.quantity,
        product: {
          connect: {
            id: product.id,
          },
        },
      },
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

  async updateByUuid(uuid: string, dto: UpdateCustomerProductDto) {
    const customerProduct = await this.customerProductRepository.getThrowByUuid(
      {
        uuid,
        select: selectCustomerProductForUpdate,
      },
    );
    if (customerProduct.productId) {
      if (customerProduct.product.stock < dto.quantity) {
        throw new CustomError({
          message: 'Stok tidak mencukupi',
          statusCode: 400,
        });
      }
    }

    return await this.customerProductRepository.updateByUuid({
      uuid,
      data: {
        quantity: dto.quantity,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    await this.customerProductRepository.getThrowByUuid({ uuid });
    return await this.customerProductRepository.deleteByUuid({ uuid });
  }
}
