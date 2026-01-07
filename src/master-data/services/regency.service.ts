import { Injectable } from '@nestjs/common';
import { RegencyRepository } from '../repositories/regency.repository';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Injectable()
export class RegencyService {
  constructor(private readonly regencyRepository: RegencyRepository) {}

  // READ
  async handleGetByUuid(uuid: string) {
    return await this.regencyRepository.getThrowByUuid({
      uuid,
    });
  }

  async handleGetManyPaginate(
    dto: SearchPaginationDto & { provinceCode?: string },
  ) {
    return await this.regencyRepository.getManyPaginate({
      filter: dto,
      where: {
        ...(dto.provinceCode
          ? {
              provinceCode: dto.provinceCode,
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

  async handleGetMany(dto: SearchPaginationDto & { provinceCode?: string }) {
    return await this.regencyRepository.getMany({
      where: {
        ...(dto.provinceCode
          ? {
              provinceCode: dto.provinceCode,
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
