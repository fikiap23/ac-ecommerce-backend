import { Prisma } from '@prisma/client';

export const SelectGeneralCustomerAddress: Prisma.CustomerAddressSelect = {
  uuid: true,
  province: true,
  city: true,
  subDistrict: true,
  suburbOrVillage: true,
  postalCode: true,
  label: true,
  address: true,
  details: true,
  isMain: true,
};
