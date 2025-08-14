import { Prisma } from '@prisma/client';
import { IFilterUserManagement } from 'src/user-management/interfaces/user-management.interface';

export const whereUserManagementGetManyPaginate = (
  props: IFilterUserManagement,
) => {
  const { search } = props;

  if (!search || search === '') {
    return {};
  }

  const where: Prisma.UserAdminWhereInput = {
    OR: [
      { fullname: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ],
  };

  return { where };
};
