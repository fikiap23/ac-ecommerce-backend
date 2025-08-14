import { IUserAdmin } from 'prisma/interfaces/user-admin.interface';

export const userAdminDatas: IUserAdmin[] = [
  {
    fullname: 'Super Admin',
    username: 'superadmin',
    email: 'superadmin@gmail.com',
    password: process.env.SUPER_ADMIN_PASSWORD_SEED,
    role: 'SUPER_ADMIN',
  },
];
