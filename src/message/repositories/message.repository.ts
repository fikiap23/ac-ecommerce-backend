import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CustomError } from 'helpers/http.helper';
import { MessageQuery } from 'src/prisma/queries/message/message.query';
import { IFilterMessage } from '../interfaces/message.interface';
import { whereMessageGetManyPaginate } from 'src/prisma/queries/message/props/where-message.prop';

@Injectable()
export class MessageRepository {
  constructor(private readonly messageQuery: MessageQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Message Repository
    |--------------------------------------------------------------------------
    */

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.MessageCreateInput;
  }) {
    return this.messageQuery.create({
      tx,
      data,
    });
  }

  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.MessageSelect;
  }) {
    const result = await this.messageQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Message Tidak Ditemukan!',
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
    select?: Prisma.MessageSelect;
  }) {
    const result = await this.messageQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Message Tidak Ditemukan!',
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
    data: Prisma.MessageUpdateInput;
  }) {
    return this.messageQuery.update({
      tx,
      id,
      data,
    });
  }

  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return this.messageQuery.delete({ tx, id });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.MessageWhereInput;
    select?: Prisma.MessageSelect;
  }) {
    return await this.messageQuery.findMany({ tx, where, select });
  }

  async getManyPaginate({
    tx,
    filter,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterMessage;
    select?: Prisma.MessageSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereMessageGetManyPaginate(filter);

    return await this.messageQuery.findManyPaginate({
      tx,
      where,
      orderBy: { createdAt: sort },
      select,
      page,
      limit,
    });
  }
}
