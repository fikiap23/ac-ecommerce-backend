import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({});
@Injectable()
export class GalleryQuery extends PrismaService {
  async findById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.GallerySelect;
  }) {
    const prisma = tx ?? this;
    return prisma.gallery.findUnique({
      where: { id },
      select,
    });
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.GallerySelect;
  }) {
    const prisma = tx ?? this;
    return prisma.gallery.findUnique({
      where: { uuid },
      select,
    });
  }

  async findMany({
    tx,
    where,
    select,
    orderBy,
    skip,
    take,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.GalleryWhereInput;
    select?: Prisma.GallerySelect;
    orderBy?: Prisma.GalleryOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const prisma = tx ?? this;
    return prisma.gallery.findMany({
      where,
      select,
      orderBy,
      skip,
      take,
    });
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
    where?: Prisma.GalleryWhereInput;
    select?: Prisma.GallerySelect;
    orderBy?: Prisma.GalleryOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.gallery,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async create({
    tx,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.GalleryCreateInput;
    select?: Prisma.GallerySelect;
  }) {
    const prisma = tx ?? this;
    return prisma.gallery.create({
      data,
      select,
    });
  }

  async createMany({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.GalleryCreateManyInput[];
  }) {
    const prisma = tx ?? this;
    return prisma.gallery.createMany({
      data,
    });
  }

  async update({
    tx,
    id,
    data,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.GalleryUpdateInput;
    select?: Prisma.GallerySelect;
  }) {
    const prisma = tx ?? this;
    return prisma.gallery.update({
      where: { id },
      data,
      select,
    });
  }

  async delete({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    const prisma = tx ?? this;
    return prisma.gallery.delete({
      where: { id },
    });
  }
}
