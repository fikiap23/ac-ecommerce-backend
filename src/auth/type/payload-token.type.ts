import { TypeRoleAdmin } from '@prisma/client';

export type PayloadToken = {
  sub: string;
  role: TypeRoleAdmin;
  iat: number;
  exp: number;
};
