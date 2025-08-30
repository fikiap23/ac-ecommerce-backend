import { Injectable } from '@nestjs/common';
import { CreateDriveryDto, UpdateDriveryDto } from '../dto/driver.dto';
import { DriverRepository } from '../repositories/driver.repository';

@Injectable()
export class DriverService {
  constructor(private readonly driverRepository: DriverRepository) {}

  async create(dto: CreateDriveryDto) {
    const { ...cleanDto } = dto;
    return await this.driverRepository.create({
      data: {
        ...cleanDto,
      },
    });
  }

  async getAll() {
    return await this.driverRepository.getMany({});
  }

  async getByUuid(uuid: string) {
    return await this.driverRepository.getThrowByUuid({
      uuid,
    });
  }

  async updateByUuid(uuid: string, dto: UpdateDriveryDto) {
    const capacity = await this.driverRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.driverRepository.updateById({
      id: capacity.id,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const capacity = await this.driverRepository.getThrowByUuid({
      uuid,
    });
    return await this.driverRepository.deleteById({ id: capacity.id });
  }
}
