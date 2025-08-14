import { Injectable } from '@nestjs/common';
import { Prisma, TypeStatusVoucher } from '@prisma/client';
import { VoucherQuery } from 'src/prisma/queries/voucher/voucher.query';
import {
  ICreateVoucher,
  IFilterVoucher,
  IUpdateVoucher,
} from '../interfaces/voucher.interface';
import { CustomError } from 'helpers/http.helper';
import { whereVoucherGetManyPaginate } from 'src/prisma/queries/voucher/props/where-voucher.prop';

@Injectable()
export class VoucherRepository {
  constructor(private readonly voucherQuery: VoucherQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Voucher Repository
    |--------------------------------------------------------------------------
    */

  getVoucherStatusByDate(startDate: Date): TypeStatusVoucher {
    const now = new Date();

    if (startDate.getTime() > now.getTime()) {
      return TypeStatusVoucher.NOT_YET_READY;
    }
    return TypeStatusVoucher.ON_GOING;
  }

  async checkingAllStatusAndUpdateVoucher() {
    const now = new Date();

    const vouchers = await this.getMany({});

    for (const voucher of vouchers) {
      if (
        voucher.status === TypeStatusVoucher.NOT_YET_READY &&
        voucher.startDate <= now
      ) {
        await this.updateById({
          id: voucher.id,
          data: {
            status: TypeStatusVoucher.ON_GOING,
          },
        });
      } else if (
        voucher.status === TypeStatusVoucher.ON_GOING &&
        voucher.endDate <= now
      ) {
        await this.updateById({
          id: voucher.id,
          data: {
            status: TypeStatusVoucher.FINISH,
          },
        });
      }
    }
  }

  async checkingOneStatusAndUpdateVoucher(uuid: string) {
    const now = new Date();

    const voucher = await this.getThrowByUuid({ uuid });

    if (
      voucher.status === TypeStatusVoucher.NOT_YET_READY &&
      voucher.startDate <= now
    ) {
      await this.updateByUuid({
        uuid,
        data: {
          status: TypeStatusVoucher.ON_GOING,
        },
      });
    } else if (
      voucher.status === TypeStatusVoucher.ON_GOING &&
      voucher.endDate <= now
    ) {
      await this.updateByUuid({
        uuid,
        data: {
          status: TypeStatusVoucher.FINISH,
        },
      });
    }
  }

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateVoucher;
  }) {
    return await this.voucherQuery.create({
      tx,
      data,
    });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.VoucherWhereInput;
    select?: Prisma.VoucherSelect;
  }) {
    return await this.voucherQuery.findMany({ tx, where, select });
  }

  async getManyPaginate({
    tx,
    filter,
    where: additionalWhere,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterVoucher;
    where?: Prisma.VoucherWhereInput;
    select?: Prisma.VoucherSelect;
  }) {
    const { sort, page, limit, orderBy } = filter;

    const { where } = whereVoucherGetManyPaginate(filter);

    const combinedWhere: Prisma.VoucherWhereInput = {
      AND: [where, additionalWhere].filter(Boolean),
    };

    return await this.voucherQuery.findManyPaginate({
      tx,
      where: combinedWhere,
      select,
      orderBy: { [orderBy]: sort },
      page,
      limit,
    });
  }

  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.VoucherSelect;
  }) {
    const result = await this.voucherQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Voucher Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.VoucherSelect;
  }) {
    const result = await this.voucherQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Voucher Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async updateById({
    tx,
    id,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: IUpdateVoucher;
  }) {
    return await this.voucherQuery.updateById({
      tx,
      id,
      data,
    });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateVoucher;
  }) {
    return await this.voucherQuery.updateByUuid({
      tx,
      uuid,
      data,
    });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    return await this.voucherQuery.deleteByUuid({ tx, uuid });
  }
}
