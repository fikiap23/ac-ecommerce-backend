import { Injectable } from '@nestjs/common';
import { CategoryProductRepository } from '../repositories/category-product.repository';
import { Prisma } from '@prisma/client';
import { selectGeneralCategoryProduct } from 'src/prisma/queries/product/props/select-category-product.prop';
import {
  CreateCategoryProductDto,
  UpdateCategoryProductDto,
} from '../dto/category-product.dto';
import { IFilterCategoryProduct } from '../interfaces/category-product.interface';

@Injectable()
export class CategoryProductService {
  constructor(
    private readonly categoryProductRepository: CategoryProductRepository,
  ) {}

  async create(dto: CreateCategoryProductDto) {
    const { ...cleanDto } = dto;
    return await this.categoryProductRepository.create({
      data: {
        ...cleanDto,
      },
    });
  }

  async getAll(filter: IFilterCategoryProduct) {
    return await this.categoryProductRepository.getManyPaginate({
      filter,
      select: selectGeneralCategoryProduct,
    });
  }

  async getByUuid(uuid: string) {
    return await this.categoryProductRepository.getThrowByUuid({
      uuid,
      select: selectGeneralCategoryProduct,
    });
  }

  async updateByUuid(uuid: string, dto: UpdateCategoryProductDto) {
    await this.categoryProductRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.categoryProductRepository.updateByUuid({
      uuid,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    await this.categoryProductRepository.getThrowByUuid({
      uuid,
    });
    return await this.categoryProductRepository.deleteByUuid({ uuid });
  }
}
