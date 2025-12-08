import { Injectable } from '@nestjs/common';
import { GalleryRepository } from '../repository/gallery.repository';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Injectable()
export class GalleryService {
  constructor(private readonly galleryRepository: GalleryRepository) {}

  async create(image: Express.Multer.File) {
    const urlImage = await this.galleryRepository.uploadImage(image);
    return await this.galleryRepository.create({
      data: {
        url: urlImage,
      },
    });
  }

  async createMany(images: Express.Multer.File[]) {
    const uploadedUrls: string[] = [];

    for (const img of images) {
      const url = await this.galleryRepository.uploadImage(img);
      uploadedUrls.push(url);
    }

    return await this.galleryRepository.createMany({
      data: uploadedUrls.map((url) => ({ url })),
    });
  }

  async getAll() {
    return await this.galleryRepository.getMany({});
  }

  async getByUuid(uuid: string) {
    return await this.galleryRepository.getThrowByUuid({ uuid });
  }

  async updateByUuid(uuid: string, image?: Express.Multer.File) {
    const existBanner = await this.galleryRepository.getThrowByUuid({ uuid });

    let urlImage: string | undefined;

    if (image) {
      await this.galleryRepository.deleteImage(existBanner.url);
      urlImage = await this.galleryRepository.uploadImage(image);
    }

    return await this.galleryRepository.updateById({
      id: existBanner.id,
      data: {
        url: urlImage,
      },
    });
  }

  async updateByUuidMultiple(uuid: string, images: Express.Multer.File[]) {
    const existBanner = await this.galleryRepository.getThrowByUuid({ uuid });

    await this.galleryRepository.deleteImage(existBanner.url);

    const uploadedUrls: string[] = [];
    for (const img of images) {
      const url = await this.galleryRepository.uploadImage(img);
      uploadedUrls.push(url);
    }

    return this.galleryRepository.updateById({
      id: existBanner.id,
      data: { url: uploadedUrls[0] },
    });
  }

  async deleteByUuid(uuid: string) {
    const existBanner = await this.galleryRepository.getThrowByUuid({ uuid });
    await this.galleryRepository.deleteImage(existBanner.url);
    return await this.galleryRepository.deleteById({ id: existBanner.id });
  }
}
