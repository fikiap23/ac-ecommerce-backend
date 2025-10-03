import { Prisma } from '@prisma/client';
import { IFilterMessage } from 'src/message/interfaces/message.interface';

export const whereMessageGetManyPaginate = (props: IFilterMessage) => {
  const { search } = props;

  if (!search || search === '') {
    return {};
  }

  const where: Prisma.MessageWhereInput = {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ],
  };

  return { where };
};
