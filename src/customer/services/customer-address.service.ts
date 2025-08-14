import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { CustomerAddressRepository } from '../repositories/customer-address.repository';
import {
  CreateCustomerAddressDto,
  UpdateCustomerAddressDto,
} from '../dto/customer-address.dto';
import { IFilterCustomerAddress } from '../interfaces/customer-address.interface';
import { SelectGeneralCustomerAddress } from 'src/prisma/queries/customer/props/select-customer-address.prop';

@Injectable()
export class CustomerAddressService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerAddressRepository: CustomerAddressRepository,
  ) {}

  async create(uuid: string, dto: CreateCustomerAddressDto) {
    const customer = await this.customerRepository.getThrowByUuid({ uuid });
    const customerAddresses = await this.customerAddressRepository.getMany({
      where: { customerId: customer.id },
    });
    const isFirstAddress = customerAddresses.length === 0;
    if (isFirstAddress) {
      dto.isMain = true;
    }
    if (dto.isMain) {
      const existingMain = customerAddresses.find((a) => a.isMain);
      if (existingMain) {
        await this.customerAddressRepository.updateByUuid({
          addressUuid: existingMain.uuid,
          customerId: customer.id,
          data: { isMain: false },
        });
      }
    }
    return await this.customerAddressRepository.create({
      data: {
        ...dto,
        customer: { connect: { id: customer.id } },
      },
    });
  }

  async getAll(uuid: string, filter: IFilterCustomerAddress) {
    const customerId = await this.customerRepository.getThrowByUuid({ uuid });
    return await this.customerAddressRepository.getManyPaginate({
      filter,
      where: { customerId: customerId.id },
      select: SelectGeneralCustomerAddress,
    });
  }

  async getByUuid(customerUuid: string, addressUuid: string) {
    const customer = await this.customerRepository.getThrowByUuid({
      uuid: customerUuid,
    });
    return await this.customerAddressRepository.getThrowByUuid({
      addressUuid,
      customerId: customer.id,
      select: SelectGeneralCustomerAddress,
    });
  }

  async updateByUuid(
    customerUuid: string,
    addressUuid: string,
    dto: UpdateCustomerAddressDto,
  ) {
    const customer = await this.customerRepository.getThrowByUuid({
      uuid: customerUuid,
    });
    await this.customerAddressRepository.getThrowByUuid({
      addressUuid,
      customerId: customer.id,
    });
    const customerAddresses = await this.customerAddressRepository.getMany({
      where: { customerId: customer.id },
    });
    if (dto.isMain === false) {
      const mainAddresses = customerAddresses.filter((a) => a.isMain);
      if (mainAddresses.length === 1 && mainAddresses[0].uuid === addressUuid) {
        dto.isMain = true;
      }
    }
    if (dto.isMain === true) {
      const currentMain = customerAddresses.find((a) => a.isMain);
      if (currentMain) {
        await this.customerAddressRepository.updateByUuid({
          addressUuid: currentMain.uuid,
          customerId: customer.id,
          data: { isMain: false },
        });
      }
    }
    return await this.customerAddressRepository.updateByUuid({
      addressUuid,
      customerId: customer.id,
      data: dto,
    });
  }

  async deleteByUuid(customerUuid: string, addressUuid: string) {
    const customer = await this.customerRepository.getThrowByUuid({
      uuid: customerUuid,
    });
    const address = await this.customerAddressRepository.getThrowByUuid({
      addressUuid,
      customerId: customer.id,
    });
    if (address.isMain) {
      const otherAddresses = await this.customerAddressRepository.getMany({
        where: {
          customerId: customer.id,
          isMain: false,
        },
        orderBy: { createdAt: 'desc' },
      });
      const hasNoOtherAddress = otherAddresses.length === 0;
      if (!hasNoOtherAddress) {
        const newestAddress = otherAddresses[0];
        await this.customerAddressRepository.updateByUuid({
          addressUuid: newestAddress.uuid,
          customerId: customer.id,
          data: { isMain: true },
        });
      }
    }
    return this.customerAddressRepository.deleteByUuid({
      addressUuid,
      customerId: customer.id,
    });
  }
}
