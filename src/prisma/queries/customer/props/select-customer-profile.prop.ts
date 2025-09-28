import { Prisma } from '@prisma/client';

export const SelectGeneralCustomerProfile: Prisma.CustomerSelect = {
  uuid: true,
  id: true,
  profilePic: true,
  name: true,
  email: true,
  phoneNumber: true,
};
