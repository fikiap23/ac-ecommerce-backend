import { Injectable } from '@nestjs/common';
import { UserManagementRepository } from '../repositories/user-management.repository';
import {
  CreateUserManagementDto,
  UpdateUserManagementDto,
} from '../dto/user-management.dto';
import * as bcrypt from 'bcrypt';
import { IFilterUserManagement } from '../interfaces/user-management.interface';
import { selectGeneralUserManagement } from 'src/prisma/queries/user-management/props/select-user-management.prop';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userManagementRepository: UserManagementRepository,
  ) {}

  async create(dto: CreateUserManagementDto) {
    await this.userManagementRepository.isUsernameUnique({
      username: dto.username,
    });
    await this.userManagementRepository.isEmailUnique({
      email: dto.email,
    });
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);
    dto.password = hash;
    return await this.userManagementRepository.create({
      data: dto,
    });
  }

  async getAll(filter: IFilterUserManagement) {
    return await this.userManagementRepository.getManyPaginate({
      filter,
      select: selectGeneralUserManagement,
    });
  }

  async getByUuid(uuid: string) {
    return await this.userManagementRepository.getThrowByUuid({
      uuid,
      select: selectGeneralUserManagement,
    });
  }

  async updateByUuid(uuid: string, dto: UpdateUserManagementDto) {
    await this.userManagementRepository.getThrowByUuid({ uuid });
    await this.userManagementRepository.isEmailUnique({
      email: dto.email,
      excludeUuid: uuid,
    });
    await this.userManagementRepository.isUsernameUnique({
      username: dto.username,
      excludeUuid: uuid,
    });
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(dto.password, salt);
      dto.password = hash;
    }
    return await this.userManagementRepository.updateByUuid({
      uuid,
      data: dto,
    });
  }

  async deleteByUuid(uuid: string) {
    await this.userManagementRepository.getThrowByUuid({
      uuid,
    });
    return await this.userManagementRepository.deleteByUuid({ uuid });
  }
}
