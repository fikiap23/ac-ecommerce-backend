import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { ProvinceService } from '../services/province.service';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Get()
  async getManyProvince(
    @Query() dto: SearchPaginationDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.provinceService.handleGetMany(dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('paginate')
  async getManyProvincePaginate(
    @Query() dto: SearchPaginationDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.provinceService.handleGetManyPaginate(dto);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getProvinceByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.provinceService.handleGetByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
