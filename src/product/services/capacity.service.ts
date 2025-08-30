import { Injectable } from '@nestjs/common';
import { CapacityRepository } from '../repositories/capacity.repository';
import { CreateCapacityDto, UpdateCapacityDto } from '../dto/capacity.dto';

@Injectable()
export class CapacityService {
  constructor(private readonly categoryProductRepository: CapacityRepository) {}

  async create(dto: CreateCapacityDto) {
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

  async updateByUuid(uuid: string, dto: UpdateCapacityDto) {
    const capacity = await this.categoryProductRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.categoryProductRepository.updateById({
      id: capacity.id,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const capacity = await this.categoryProductRepository.getThrowByUuid({
      uuid,
    });
    return await this.categoryProductRepository.deleteById({ id: capacity.id });
  }
}
