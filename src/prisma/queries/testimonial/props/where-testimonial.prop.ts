import { Prisma } from '@prisma/client';
import { IFilterTestimonial } from 'src/testimonial/interface/testimonial.interface';

export const whereTestimonialGetManyPaginate = (props: IFilterTestimonial) => {
  const { search, productId, bundleId, status } = props;

  const where: Prisma.TestimonialWhereInput = {};

  if (search && search !== '') {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { cityOrDistrict: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (productId) {
    where.productId = productId;
  }

  if (bundleId) {
    where.bundleId = bundleId;
  }

  if (status) {
    where.status = status;
  }

  return { where };
};
