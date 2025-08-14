import { Injectable } from '@nestjs/common';
import { CreateVoucherDto, UpdateVoucherDto } from '../dto/voucher.dto';
import { CustomError } from 'helpers/http.helper';

@Injectable()
export class VoucherValidateRepository {
  /*
    |-------------------------------------------------------------------------- 
    | Voucher Validate Repository 
    |-------------------------------------------------------------------------- 
    */

  validateDate(dto: CreateVoucherDto | UpdateVoucherDto) {
    if (dto.startDate > dto.endDate) {
      throw new CustomError({
        message: 'Tanggal mulai voucher harus sebelum tanggal berakhir',
        statusCode: 400,
      });
    }
  }
}
