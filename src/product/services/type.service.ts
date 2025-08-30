import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TypeRepository } from '../repositories/type.repository';
import { CreateTypeDto, UpdateTypeDto } from '../dto/type.dto';

@Injectable()
export class TypeService {
  constructor(private readonly categoryProductRepository: TypeRepository) {}

  async create(dto: CreateTypeDto) {
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

  async updateByUuid(uuid: string, dto: UpdateTypeDto) {
    const type = await this.categoryProductRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.categoryProductRepository.updateById({
      id: type.id,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const type = await this.categoryProductRepository.getThrowByUuid({
      uuid,
    });
    return await this.categoryProductRepository.deleteById({ id: type.id });
  }
}
