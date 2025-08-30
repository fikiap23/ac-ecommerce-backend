import { Injectable } from '@nestjs/common';
import { CapacityRepository } from '../repositories/capacity.repository';
import { CreateCapacityDto, UpdateCapacityDto } from '../dto/capacity.dto';

@Injectable()
export class CapacityService {
  constructor(private readonly capacityRepository: CapacityRepository) {}

  async create(dto: CreateCapacityDto) {
    const { ...cleanDto } = dto;
    return await this.capacityRepository.create({
      data: {
        ...cleanDto,
      },
    });
  }

  async getAll() {
    return await this.capacityRepository.getMany({});
  }

  async getByUuid(uuid: string) {
    return await this.capacityRepository.getThrowByUuid({
      uuid,
    });
  }

  async updateByUuid(uuid: string, dto: UpdateCapacityDto) {
    const capacity = await this.capacityRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.capacityRepository.updateById({
      id: capacity.id,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const capacity = await this.capacityRepository.getThrowByUuid({
      uuid,
    });
    return await this.capacityRepository.deleteById({ id: capacity.id });
  }
}
