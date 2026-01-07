import { Injectable } from '@nestjs/common';
import { VillageRepository } from '../repositories/village.repository';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Injectable()
export class VillageService {
  constructor(private readonly villageRepository: VillageRepository) {}

  // READ
  async handleGetByUuid(uuid: string) {
    return await this.villageRepository.getThrowByUuid({
      uuid,
    });
  }

  async handleGetManyPaginate(
    dto: SearchPaginationDto & { districtCode?: string },
  ) {
    return await this.villageRepository.getManyPaginate({
      filter: dto,
      where: {
        ...(dto.districtCode
          ? {
              districtCode: dto.districtCode,
            }
          : {}),
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

  async handleGetMany(dto: SearchPaginationDto & { districtCode?: string }) {
    return await this.villageRepository.getMany({
      where: {
        ...(dto.districtCode
          ? {
              districtCode: dto.districtCode,
            }
          : {}),
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
