import { Injectable } from '@nestjs/common';
import { ProvinceRepository } from '../repositories/province.repository';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Injectable()
export class ProvinceService {
  constructor(private readonly provinceRepository: ProvinceRepository) {}

  // READ
  async handleGetByUuid(uuid: string) {
    return await this.provinceRepository.getThrowByUuid({
      uuid,
    });
  }

  async handleGetManyPaginate(dto: SearchPaginationDto) {
    return await this.provinceRepository.getManyPaginate({
      filter: dto,
      where: {
        ...(dto.search
          ? {
              name: {
                contains: dto.search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
    });
  }

  async handleGetMany(dto: SearchPaginationDto) {
    return await this.provinceRepository.getMany({
      where: {
        ...(dto.search
          ? {
              name: {
                contains: dto.search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
    });
  }
}
