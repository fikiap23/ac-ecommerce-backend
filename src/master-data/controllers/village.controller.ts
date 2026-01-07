import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { VillageService } from '../services/village.service';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Controller('village')
export class VillageController {
  constructor(private readonly villageService: VillageService) {}

  @Get()
  async getManyVillage(
    @Query() dto: SearchPaginationDto & { districtCode?: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.villageService.handleGetMany(dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('paginate')
  async getManyVillagePaginate(
    @Query() dto: SearchPaginationDto & { districtCode?: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.villageService.handleGetManyPaginate(dto);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getVillageByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.villageService.handleGetByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
