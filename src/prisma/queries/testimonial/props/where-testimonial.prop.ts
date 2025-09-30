import { Prisma } from '@prisma/client';
import { IFilterTestimonial } from 'src/testimonial/interface/testimonial.interface';

export const whereTestimonialGetManyPaginate = (props: IFilterTestimonial) => {
  const { search, productId } = props;

  if (!search || search === '') {
    return {};
  }

  const where: Prisma.TestimonialWhereInput = {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { cityOrDistrict: { contains: search, mode: 'insensitive' } },
    ],
  };

  if (productId) {
    where.productId = productId;
  }
  return { where };
};
