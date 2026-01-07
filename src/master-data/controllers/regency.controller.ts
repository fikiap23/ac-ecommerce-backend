import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { RegencyService } from '../services/regency.service';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Controller('regency')
export class RegencyController {
  constructor(private readonly regencyService: RegencyService) {}

  @Get()
  async getManyRegency(
    @Query() dto: SearchPaginationDto & { provinceCode?: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.regencyService.handleGetMany(dto);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('paginate')
  async getManyRegencyPaginate(
    @Query() dto: SearchPaginationDto & { provinceCode?: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.regencyService.handleGetManyPaginate(dto);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get(':uuid')
  async getRegencyByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.regencyService.handleGetByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
