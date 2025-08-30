import { Injectable } from '@nestjs/common';
import {
  CreateTechnicianDto,
  UpdateTechnicianDto,
} from '../dto/technician.dto';
import { TechnicianRepository } from 'src/technician/repositories/technician.repository';

@Injectable()
export class TechnicianService {
  constructor(private readonly technicianRepository: TechnicianRepository) {}

  async create(dto: CreateTechnicianDto) {
    const { ...cleanDto } = dto;
    return await this.technicianRepository.create({
      data: {
        ...cleanDto,
      },
    });
  }

  async getAll() {
    return await this.technicianRepository.getMany({});
  }

  async getByUuid(uuid: string) {
    return await this.technicianRepository.getThrowByUuid({
      uuid,
    });
  }

  async updateByUuid(uuid: string, dto: UpdateTechnicianDto) {
    const capacity = await this.technicianRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.technicianRepository.updateById({
      id: capacity.id,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const capacity = await this.technicianRepository.getThrowByUuid({
      uuid,
    });
    return await this.technicianRepository.deleteById({ id: capacity.id });
  }
}
