import { Injectable } from '@nestjs/common';
import { DistrictRepository } from '../repositories/district.repository';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Injectable()
export class DistrictService {
  constructor(private readonly districtRepository: DistrictRepository) {}

  // READ
  async handleGetByUuid(uuid: string) {
    return await this.districtRepository.getThrowByUuid({
      uuid,
    });
  }

  async handleGetManyPaginate(
    dto: SearchPaginationDto & { regencyCode?: string },
  ) {
    return await this.districtRepository.getManyPaginate({
      filter: dto,
      where: {
        ...(dto.regencyCode
          ? {
              regencyCode: dto.regencyCode,
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

  async handleGetMany(dto: SearchPaginationDto & { regencyCode?: string }) {
    return await this.districtRepository.getMany({
      where: {
        ...(dto.regencyCode
          ? {
              regencyCode: dto.regencyCode,
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
