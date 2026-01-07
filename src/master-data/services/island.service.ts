import { Injectable } from '@nestjs/common';
import { IslandRepository } from '../repositories/island.repository';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Injectable()
export class IslandService {
  constructor(private readonly islandRepository: IslandRepository) {}

  // READ
  async handleGetByUuid(uuid: string) {
    return await this.islandRepository.getThrowByUuid({
      uuid,
    });
  }

  async handleGetManyPaginate(
    dto: SearchPaginationDto & { regencyCode?: string },
  ) {
    return await this.islandRepository.getManyPaginate({
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
    return await this.islandRepository.getMany({
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
