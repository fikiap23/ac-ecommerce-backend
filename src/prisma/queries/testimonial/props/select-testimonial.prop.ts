import { Prisma } from '@prisma/client';

export const selectGeneralTestimonial: Prisma.TestimonialSelect = {
  uuid: true,
  name: true,
  cityOrDistrict: true,
  productDescription: true,
  description: true,
  videoOrImage: true,
};
