import { UserAdmin } from '@prisma/client';

export type IUserAdmin = Pick<
  UserAdmin,
  'fullname' | 'username' | 'email' | 'password' | 'role'
>;
