import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { UpdateCustomerDto } from '../dto/customer.dto';
import { SelectGeneralCustomerProfile } from 'src/prisma/queries/customer/props/select-customer-profile.prop';
import { IFilterCustomer } from '../interfaces/customer.interface';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Injectable()
export class CustomerProfileService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getByUuid(uuid: string) {
    return this.customerRepository.getThrowByUuid({
      uuid,
      select: SelectGeneralCustomerProfile,
    });
  }

  async getManyPaginate(dto: SearchPaginationDto) {
    return this.customerRepository.getManyPaginate({
      filter: dto,
      select: SelectGeneralCustomerProfile,
    });
  }

  async updateByUuid(
    uuid: string,
    dto: UpdateCustomerDto,
    image?: Express.Multer.File,
  ) {
    const existCustomer = await this.customerRepository.getThrowByUuid({
      uuid,
    });

    if (dto.phoneNumber) {
      await this.customerRepository.isPhoneNumberUnique({
        phoneNumber: dto.phoneNumber,
        excludeUuid: uuid,
      });
    }

    let urlImage: string | undefined;
    if (image) {
      urlImage = await this.customerRepository.uploadImage(image);
    }

    return this.customerRepository.updateByUuid({
      uuid,
      data: {
        profilePic: urlImage,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
      },
    });
  }
}
