import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { UpdateCustomerDto } from '../dto/customer.dto';
import { SelectGeneralCustomerProfile } from 'src/prisma/queries/customer/props/select-customer-profile.prop';

@Injectable()
export class CustomerProfileService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getByUuid(uuid: string) {
    return await this.customerRepository.getThrowByUuid({
      uuid,
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
      const profilePicFromStorage =
        await this.customerRepository.checkProfilePictureFromStorage(
          existCustomer.profilePic,
        );
      if (profilePicFromStorage) {
        await this.customerRepository.deleteProfilePicture(
          existCustomer.profilePic,
        );
      }
      urlImage = await this.customerRepository.uploadProfilePicture(image);
    }
    return await this.customerRepository.updateByUuid({
      uuid,
      data: {
        profilePic: urlImage,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
      },
    });
  }
}
