import { Injectable } from '@nestjs/common';
import { CustomError } from 'helpers/http.helper';

@Injectable()
export class BannerCampaignValidateRepository {
  /*
    |--------------------------------------------------------------------------
    | Banner Campaign Vaidate Repository
    |--------------------------------------------------------------------------
    */

  validateImage(image: Express.Multer.File) {
    if (!image) {
      throw new CustomError({
        message: 'Gambar wajib diisi',
        statusCode: 400,
      });
    }
  }
}
