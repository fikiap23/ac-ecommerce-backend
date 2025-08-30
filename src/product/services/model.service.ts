import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ModelRepository } from '../repositories/model.repository';
import { CreateModelDto, UpdateModelDto } from '../dto/model.dto';

@Injectable()
export class ModelService {
  constructor(private readonly modelRepository: ModelRepository) {}

  async create(dto: CreateModelDto) {
    const { ...cleanDto } = dto;
    return await this.modelRepository.create({
      data: {
        ...cleanDto,
      },
    });
  }

  async getAll() {
    return await this.modelRepository.getMany({});
  }

  async getByUuid(uuid: string) {
    return await this.modelRepository.getThrowByUuid({
      uuid,
    });
  }

  async updateByUuid(uuid: string, dto: UpdateModelDto) {
    const model = await this.modelRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.modelRepository.updateById({
      id: model.id,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const model = await this.modelRepository.getThrowByUuid({
      uuid,
    });
    return await this.modelRepository.deleteById({ id: model.id });
  }
}
