import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { DistrictService } from '../services/district.service';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Controller('district')
export class DistrictController {
  constructor(private readonly districtService: DistrictService) {}

  @Get()
  async getManyDistrict(
    @Query() dto: SearchPaginationDto & { regencyCode?: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.districtService.handleGetMany(dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('paginate')
  async getManyDistrictPaginate(
    @Query() dto: SearchPaginationDto & { regencyCode?: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.districtService.handleGetManyPaginate(dto);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getDistrictByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.districtService.handleGetByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
