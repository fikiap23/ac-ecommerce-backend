import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginateFunction, paginator } from 'src/prisma/paginator/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ICreateUserManagement,
  IUpdateUserManagement,
} from 'src/user-management/interfaces/user-management.interface';

const paginate: PaginateFunction = paginator({});

@Injectable()
export class UserManagementQuery extends PrismaService {
  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateUserManagement;
  }) {
    const prisma = tx ?? this;
    return await prisma.userAdmin.create({
      data,
    });
  }

  async findByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.UserAdminSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.userAdmin.findUnique({
      where: { uuid },
      select,
    });
  }

  async findByUsername({
    tx,
    username,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    username: string;
    select?: Prisma.UserAdminSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.userAdmin.findUnique({
      where: { username },
      select,
    });
  }

  async findByEmail({
    tx,
    email,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    email: string;
    select?: Prisma.UserAdminSelect;
  }) {
    const prisma = tx ?? this;
    return await prisma.userAdmin.findUnique({
      where: { email },
      select,
    });
  }

  async isUsernameUnique({
    tx,
    username,
    excludeUuid,
  }: {
    tx?: Prisma.TransactionClient;
    username: string;
    excludeUuid?: string;
  }) {
    const prisma = tx ?? this;

    const existingUser = await prisma.userAdmin.findFirst({
      where: {
        username,
        ...(excludeUuid && {
          uuid: {
            not: excludeUuid,
          },
        }),
      },
      select: { id: true },
    });

    return existingUser;
  }
  async isEmailUnique({
    tx,
    email,
    excludeUuid,
  }: {
    tx?: Prisma.TransactionClient;
    email: string;
    excludeUuid?: string;
  }) {
    const prisma = tx ?? this;

    const existingUser = await prisma.userAdmin.findFirst({
      where: {
        email,
        ...(excludeUuid && {
          uuid: {
            not: excludeUuid,
          },
        }),
      },
      select: { id: true },
    });

    return existingUser;
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
    where?: Prisma.UserAdminWhereInput;
    select?: Prisma.UserAdminSelect;
    orderBy?: Prisma.UserAdminOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }) {
    const prisma = tx ?? this;
    return paginate(
      prisma.userAdmin,
      { where, select, orderBy },
      { page, perPage: limit },
    );
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateUserManagement;
  }) {
    const prisma = tx ?? this;
    return await prisma.userAdmin.update({ where: { uuid }, data });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    const prisma = tx ?? this;
    return await prisma.userAdmin.delete({ where: { uuid } });
  }
}
