import { Prisma } from '@prisma/client';

export const selectGeneralTestimonial: Prisma.TestimonialSelect = {
  uuid: true,
  name: true,
  cityOrDistrict: true,
  productDescription: true,
  description: true,
  videoOrImage: true,
  rating: true,
  status: true,
  createdBy: true,
  productId: true,
  userId: true,
  product: {
    select: {
      uuid: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};
