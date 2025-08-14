import { Injectable } from '@nestjs/common';
import { CustomError } from 'helpers/http.helper';

@Injectable()
export class TestimonialValidateRepository {
  /*
    |--------------------------------------------------------------------------
    | Testimonial Vaidate Repository
    |--------------------------------------------------------------------------
    */

  validateVideoOrImage(videoOrImage: Express.Multer.File) {
    if (!videoOrImage) {
      throw new CustomError({
        message: 'Video atau gambar wajib diisi',
        statusCode: 400,
      });
    }
  }
}
