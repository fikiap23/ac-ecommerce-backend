import { Prisma } from '@prisma/client';

export const SelectGeneralCustomerProfile: Prisma.CustomerSelect = {
  profilePic: true,
  name: true,
  email: true,
  phoneNumber: true,
};
