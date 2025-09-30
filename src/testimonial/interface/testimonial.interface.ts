import { Prisma } from '@prisma/client';

export type ICreateTestimonial = Prisma.TestimonialCreateInput;
export type IUpdateTestimonial = Prisma.TestimonialUpdateInput;

export type IFilterTestimonial = {
  sort: Prisma.SortOrder;
  page: number;
  limit: number;
  search?: string;
  productId?: number;
};
