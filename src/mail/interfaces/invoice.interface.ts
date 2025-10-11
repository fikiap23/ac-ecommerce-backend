import { OrderProduct } from '@prisma/client';

export interface IProduct {
  name: string;
  price: string;
  qty: number;
  discount: string;
}

export interface IOrder {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  orderProducts: OrderProduct[];
  subtotal: string;
  totalDiscount: string;
  deliveryFee: string;
  total: string;
  status: string;
  statusColor: string;
  createdAt: Date;
}

export interface IEmailInvoice {
  subject: string;
  email: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
  order: IOrder;
}
