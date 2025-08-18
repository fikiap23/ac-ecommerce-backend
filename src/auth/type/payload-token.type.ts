import { TypeRoleAdmin } from '@prisma/client';

export type PayloadToken = {
  sub: string;
  id: number;
  role: TypeRoleAdmin;
  iat: number;
  exp: number;
};
