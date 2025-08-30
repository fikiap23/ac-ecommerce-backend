import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ModelRepository } from '../repositories/model.repository';
import { CreateModelDto, UpdateModelDto } from '../dto/model.dto';

@Injectable()
export class ModelService {
  constructor(private readonly categoryProductRepository: ModelRepository) {}

  async create(dto: CreateModelDto) {
    const { ...cleanDto } = dto;
    return await this.categoryProductRepository.create({
      data: {
        ...cleanDto,
      },
    });
  }

  async getAll() {
    return await this.categoryProductRepository.getMany({});
  }

  async getByUuid(uuid: string) {
    return await this.categoryProductRepository.getThrowByUuid({
      uuid,
    });
  }

  async updateByUuid(uuid: string, dto: UpdateModelDto) {
    const model = await this.categoryProductRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.categoryProductRepository.updateById({
      id: model.id,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const model = await this.categoryProductRepository.getThrowByUuid({
      uuid,
    });
    return await this.categoryProductRepository.deleteById({ id: model.id });
  }
}
