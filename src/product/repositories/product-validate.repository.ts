import { Injectable } from '@nestjs/common';
import { CustomError } from 'helpers/http.helper';
import { ProductImageRepository } from './product-image.repository';

@Injectable()
export class ProductValidateRepository {
  constructor(
    private readonly productImageRepository: ProductImageRepository,
  ) {}

  validateProductImages(productImages: Express.Multer.File[]) {
    if (!productImages || productImages.length === 0) {
      throw new CustomError({
        message: 'Gambar produk wajib diisi',
        statusCode: 400,
      });
    }
  }

  async validateMaximumProductImages(
    productId: number,
    productImages: Express.Multer.File[],
  ) {
    const productImagesFromDb = await this.productImageRepository.count({
      where: {
        productId,
      },
    });
    const productImagesFromDto = productImages.length;
    const maxProductImages = 5;

    if (productImagesFromDb + productImagesFromDto > maxProductImages) {
      throw new CustomError({
        message: 'Jumlah gambar produk tidak boleh melebihi 5',
        statusCode: 400,
      });
    }
  }
}
