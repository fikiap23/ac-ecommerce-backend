import { Injectable } from '@nestjs/common';
import { TestimonialRepository } from '../repositories/testimonial.repository';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from '../dto/testimonial.dto';
import { IFilterTestimonial } from '../interface/testimonial.interface';
import { selectGeneralTestimonial } from 'src/prisma/queries/testimonial/props/select-testimonial.prop';
import { TestimonialValidateRepository } from '../repositories/testimonial-validate.repository';

@Injectable()
export class TestimonialService {
  constructor(
    private readonly testimonialRepository: TestimonialRepository,
    private readonly testimonialValidateRepository: TestimonialValidateRepository,
  ) {}

  async create(dto: CreateTestimonialDto, videoOrImage: Express.Multer.File) {
    this.testimonialValidateRepository.validateVideoOrImage(videoOrImage);

    const videoOrImageUrl = await this.testimonialRepository.uploadVideoOrImage(
      videoOrImage,
    );
    const { ...cleanDto } = dto;
    return await this.testimonialRepository.create({
      data: {
        ...cleanDto,
        videoOrImage: videoOrImageUrl,
      },
    });
  }

  async getAll(filter: IFilterTestimonial) {
    return await this.testimonialRepository.getManyPaginate({
      filter,
      select: selectGeneralTestimonial,
    });
  }

  async getByUuid(uuid: string) {
    return await this.testimonialRepository.getThrowByUuid({
      uuid,
      select: selectGeneralTestimonial,
    });
  }

  async updateByUuid(
    uuid: string,
    dto: UpdateTestimonialDto,
    videoOrImage?: Express.Multer.File,
  ) {
    const existing = await this.testimonialRepository.getThrowByUuid({ uuid });

    let videoOrImageUrl: string | undefined;
    if (videoOrImage) {
      await this.testimonialRepository.deleteVideoOrImage(
        existing.videoOrImage,
      );
      videoOrImageUrl = await this.testimonialRepository.uploadVideoOrImage(
        videoOrImage,
      );
    }
    const { ...cleanDto } = dto;
    return await this.testimonialRepository.updateByUuid({
      uuid,
      data: {
        ...cleanDto,
        videoOrImage: videoOrImageUrl,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const existing = await this.testimonialRepository.getThrowByUuid({ uuid });
    await this.testimonialRepository.deleteVideoOrImage(existing.videoOrImage);
    return await this.testimonialRepository.deleteByUuid({ uuid });
  }
}
