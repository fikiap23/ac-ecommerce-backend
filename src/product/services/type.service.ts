import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TypeRepository } from '../repositories/type.repository';
import { CreateTypeDto, UpdateTypeDto } from '../dto/type.dto';

@Injectable()
export class TypeService {
  constructor(private readonly typeRepository: TypeRepository) {}

  async create(dto: CreateTypeDto) {
    const { ...cleanDto } = dto;
    return await this.typeRepository.create({
      data: {
        ...cleanDto,
      },
    });
  }

  async getAll() {
    return await this.typeRepository.getMany({});
  }

  async getByUuid(uuid: string) {
    return await this.typeRepository.getThrowByUuid({
      uuid,
    });
  }

  async updateByUuid(uuid: string, dto: UpdateTypeDto) {
    const type = await this.typeRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.typeRepository.updateById({
      id: type.id,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const type = await this.typeRepository.getThrowByUuid({
      uuid,
    });
    return await this.typeRepository.deleteById({ id: type.id });
  }
}
