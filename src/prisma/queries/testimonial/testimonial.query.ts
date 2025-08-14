import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ICreateTestimonial,
  IUpdateTestimonial,
} from 'src/testimonial/interface/testimonial.interface';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class TestimonialQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateTestimonial;
  }) {
    const prisma = tx ?? this;
    return await prisma.testimonial.create({ data });
  }

  async findManyPaginate({
    tx,
    where,
    select,
    orderBy,
    page,
    limit,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.TestimonialWhereInput;
    select?: Prisma.TestimonialSelect;
    orderBy?: Prisma.TestimonialOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.testimonial,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.TestimonialSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.testimonial.findUnique({
      where: { uuid },
      select,
    });
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateTestimonial;
  }) {
    const prisma = tx ?? this;
    return await prisma.testimonial.update({ where: { uuid }, data });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    const prisma = tx ?? this;
    return await prisma.testimonial.delete({ where: { uuid } });
  }
}
