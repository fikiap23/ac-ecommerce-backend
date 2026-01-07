import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { IslandService } from '../services/island.service';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Controller('island')
export class IslandController {
  constructor(private readonly islandService: IslandService) {}

  @Get()
  async getManyIsland(
    @Query() dto: SearchPaginationDto & { regencyCode?: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.islandService.handleGetMany(dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('paginate')
  async getManyIslandPaginate(
    @Query() dto: SearchPaginationDto & { regencyCode?: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.islandService.handleGetManyPaginate(dto);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getIslandByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.islandService.handleGetByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
