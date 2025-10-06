import { Injectable } from '@nestjs/common';
import { TestimonialRepository } from '../repositories/testimonial.repository';
import {
  CreateTestimonialDto,
  SearchTestimonialDto,
  UpdateTestimonialDto,
} from '../dto/testimonial.dto';
import { IFilterTestimonial } from '../interface/testimonial.interface';
import { selectGeneralTestimonial } from 'src/prisma/queries/testimonial/props/select-testimonial.prop';
import { UserManagementRepository } from 'src/user-management/repositories/user-management.repository';
import { CustomerRepository } from 'src/customer/repositories/customer.repository';
import { ProductRepository } from 'src/product/repositories/product.repository';
import { OrderRepository } from 'src/order/repositories/order.repository';
import { OrderProductRepository } from 'src/order/repositories/order-product.repository';

@Injectable()
export class TestimonialService {
  constructor(
    private readonly testimonialRepository: TestimonialRepository,
    private readonly userRepository: UserManagementRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderProductRepository: OrderProductRepository,
  ) {}

  async create(sub: string, role: string, dto: CreateTestimonialDto) {
    let userId: number | null = null;
    let profileUrl: string | null = null;
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      const user = await this.userRepository.getThrowByUuid({ uuid: sub });
      userId = user.id;
    } else {
      const customer = await this.customerRepository.getThrowByUuid({
        uuid: sub,
      });
      userId = customer.id;
      profileUrl = customer.profilePic;
    }

    const product = await this.productRepository.getByUuid({
      uuid: dto.productUuid,
    });
    const bundle = await this.productRepository.getBundleByUuid({
      uuid: dto.productUuid,
    });

    const { ...cleanDto } = dto;
    const testimonial = await this.testimonialRepository.create({
      data: {
        cityOrDistrict: cleanDto.cityOrDistrict,
        description: cleanDto.description,
        name: cleanDto.name,
        productDescription: cleanDto.productDescription,
        createdBy: role,
        rating: cleanDto.rating,
        status: cleanDto.status,
        userId,
        profileUrl,
        ...(product ? { product: { connect: { id: product.id } } } : {}),
        ...(bundle ? { bundle: { connect: { id: bundle.id } } } : {}),
      },
    });

    // update orderProduct
    if (dto.orderProductUuid) {
      await this.orderProductRepository.updateByUuid({
        uuid: dto.orderProductUuid,
        data: { isTestimonial: true },
      });
    }

    return testimonial;
  }

  async getAll(filter: SearchTestimonialDto) {
    let productId = undefined;
    let bundleId = undefined;
    if (filter.productUuid) {
      const product = await this.productRepository.getByUuid({
        uuid: filter.productUuid,
        select: { id: true },
      });

      if (product) {
        productId = product.id;
      } else {
        const bundle = await this.productRepository.getByUuid({
          uuid: filter.productUuid,
          select: { id: true },
        });

        if (bundle) {
          bundleId = bundle.id;
        }
      }
    }
    return await this.testimonialRepository.getManyPaginate({
      filter: {
        limit: filter.limit,
        page: filter.page,
        sort: filter.sort,
        productId,
        bundleId,
        search: filter.search,
      },
      select: selectGeneralTestimonial,
    });
  }

  async getByUuid(uuid: string) {
    return await this.testimonialRepository.getThrowByUuid({
      uuid,
      select: selectGeneralTestimonial,
    });
  }

  async update(uuid: string, dto: UpdateTestimonialDto) {
    // pastikan testimonial ada
    await this.testimonialRepository.getThrowByUuid({
      uuid,
      select: { id: true },
    });

    // jika productUuid diubah, validasi & siapkan connect
    let productConnect: { product: { connect: { id: number } } } | undefined =
      undefined;

    if (dto.productUuid) {
      const product = await this.productRepository.getThrowByUuid({
        uuid: dto.productUuid,
        select: { id: true },
      });
      productConnect = { product: { connect: { id: product.id } } };
    }

    return this.testimonialRepository.updateByUuid({
      uuid,
      data: {
        name: dto.name,
        cityOrDistrict: dto.cityOrDistrict,
        productDescription: dto.productDescription,
        description: dto.description,
        rating: dto.rating,
        status: dto.status,
        ...(productConnect ?? {}),
      },
    });
  }

  async deleteByUuid(uuid: string) {
    await this.testimonialRepository.getThrowByUuid({ uuid });
    return await this.testimonialRepository.deleteByUuid({ uuid });
  }
}
