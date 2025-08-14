import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserManagementQuery } from 'src/prisma/queries/user-management/user-management.query';
import {
  ICreateUserManagement,
  IFilterUserManagement,
  IUpdateUserManagement,
} from '../interfaces/user-management.interface';
import { whereUserManagementGetManyPaginate } from 'src/prisma/queries/user-management/props/where-user-management.prop';
import { CustomError } from 'helpers/http.helper';

@Injectable()
export class UserManagementRepository {
  constructor(private readonly userManagementQuery: UserManagementQuery) {}

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateUserManagement;
  }) {
    return await this.userManagementQuery.create({
      tx,
      data,
    });
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.UserAdminSelect;
  }) {
    const result = await this.userManagementQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'User Admin Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByEmail({
    tx,
    email,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    email: string;
    select?: Prisma.UserAdminSelect;
  }) {
    const result = await this.userManagementQuery.findByEmail({
      tx,
      email,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'User Admin Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByUsername({
    tx,
    username,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    username: string;
    select?: Prisma.UserAdminSelect;
  }) {
    const result = await this.userManagementQuery.findByUsername({
      tx,
      username,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'User Admin Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
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
    const userAdmin = await this.userManagementQuery.isUsernameUnique({
      tx,
      username,
      excludeUuid,
    });
    if (userAdmin) {
      throw new CustomError({
        message: 'Username sudah digunakan',
        statusCode: 409,
      });
    }

    return;
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
    const userAdmin = await this.userManagementQuery.isEmailUnique({
      tx,
      email,
      excludeUuid,
    });
    if (userAdmin) {
      throw new CustomError({
        message: 'Email sudah digunakan',
        statusCode: 409,
      });
    }

    return;
  }

  async getManyPaginate({
    tx,
    filter,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterUserManagement;
    select?: Prisma.UserAdminSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereUserManagementGetManyPaginate(filter);

    return await this.userManagementQuery.findManyPaginate({
      tx,
      where,
      orderBy: { createdAt: sort },
      page,
      limit,
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
    data: IUpdateUserManagement;
  }) {
    return await this.userManagementQuery.updateByUuid({
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
    return await this.userManagementQuery.deleteByUuid({ tx, uuid });
  }
}
