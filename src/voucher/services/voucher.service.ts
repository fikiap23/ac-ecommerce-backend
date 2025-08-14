import { Injectable } from '@nestjs/common';
import { VoucherRepository } from '../repositories/voucher.repository';
import { CreateVoucherDto, UpdateVoucherDto } from '../dto/voucher.dto';
import { Prisma, TypeStatusVoucher, TypeVoucher } from '@prisma/client';
import { ProductRepository } from 'src/product/repositories/product.repository';
import { IFilterVoucher } from '../interfaces/voucher.interface';
import { CustomError } from 'helpers/http.helper';
import { VoucherValidateRepository } from '../repositories/voucher-validate.repository';
import { selectGeneralVoucher } from 'src/prisma/queries/voucher/props/select-voucher.prop';

@Injectable()
export class VoucherService {
  constructor(
    private readonly voucherRepository: VoucherRepository,
    private readonly productRepository: ProductRepository,
    private readonly voucherValidateRepository: VoucherValidateRepository,
  ) {}

  async create(dto: CreateVoucherDto) {
    this.voucherValidateRepository.validateDate(dto);

    const status = this.voucherRepository.getVoucherStatusByDate(dto.startDate);

    const { items, ...cleanDto } = dto;

    const data: Prisma.VoucherCreateInput = {
      ...cleanDto,
      status,
    };

    if (dto.items?.length) {
      const productUuids = dto.items.map((item) => item.productUuid);
      const products = await this.productRepository.getMany({
        where: {
          deletedAt: null,
          uuid: { in: productUuids },
        },
      });

      if (products.length === 0) {
        throw new CustomError({
          message: 'Produk tidak ditemukan',
          statusCode: 404,
        });
      }

      data.minimumAmount = 0;

      data.productVoucher = {
        createMany: {
          data: products.map((product) => ({
            productId: product.id,
          })),
        },
      };
    }

    return await this.voucherRepository.create({ data });
  }

  async getAll(sub: string, filter: IFilterVoucher) {
    await this.voucherRepository.checkingAllStatusAndUpdateVoucher();
    return await this.voucherRepository.getManyPaginate({
      filter,
      select: selectGeneralVoucher(sub),
    });
  }

  async getByUuid(sub: string, uuid: string) {
    await this.voucherRepository.checkingOneStatusAndUpdateVoucher(uuid);
    return await this.voucherRepository.getThrowByUuid({
      uuid,
      select: selectGeneralVoucher(sub),
    });
  }

  async updateByUuid(uuid: string, dto: UpdateVoucherDto) {
    const existingVoucher = await this.voucherRepository.getThrowByUuid({
      uuid,
    });
    this.voucherValidateRepository.validateDate(dto);

    if (dto.type === TypeVoucher.FIXED) {
      dto.maxDiscount = null;
    }

    const { items, ...cleanDto } = dto;

    const updateData: Prisma.VoucherUpdateInput = {
      ...cleanDto,
    };

    if (dto.startDate || dto.endDate) {
      const status = this.voucherRepository.getVoucherStatusByDate(
        dto.startDate,
      );

      updateData.status = status;
      updateData.startDate = dto.startDate;
      updateData.endDate = dto.endDate;
    }

    updateData.productVoucher = {
      deleteMany: {
        voucherId: existingVoucher.id,
      },
    };

    if (dto?.items?.length) {
      const productUuids = dto.items.map((item) => item.productUuid);
      const products = await this.productRepository.getMany({
        where: {
          deletedAt: null,
          uuid: { in: productUuids },
        },
      });

      if (products.length === 0) {
        throw new CustomError({
          message: 'Produk tidak ditemukan',
          statusCode: 404,
        });
      }

      updateData.minimumAmount = null;

      updateData.productVoucher.createMany = {
        data: products.map((product) => ({
          productId: product.id,
        })),
      };
    }

    return await this.voucherRepository.updateByUuid({
      uuid,
      data: updateData,
    });
  }

  async deleteByUuid(uuid: string) {
    await this.voucherRepository.getThrowByUuid({ uuid });

    return await this.voucherRepository.deleteByUuid({ uuid });
  }
}
