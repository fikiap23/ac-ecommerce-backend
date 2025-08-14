import { Prisma } from '@prisma/client';

export const selectGeneralUserManagement: Prisma.UserAdminSelect = {
  uuid: true,
  fullname: true,
  username: true,
  email: true,
  role: true,
};
