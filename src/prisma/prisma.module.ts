import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { BannerCampaignQuery } from './queries/banner-campaign/banner-campaign.query';
import { TestimonialQuery } from './queries/testimonial/testimonial.query';
import { ProductQuery } from './queries/product/product.query';
import { CustomerQuery } from './queries/customer/customer.query';
import { UserManagementQuery } from './queries/user-management/user-management.query';
import { CustomerAddressQuery } from './queries/customer/customer-address.query';
import { VoucherQuery } from './queries/voucher/voucher.query';
import { CategoryProductQuery } from './queries/product/category-product.query';
import { OrderQuery } from './queries/order/order.query';
import { PaymentMethodQuery } from './queries/order/order-payment-method.query';
import { DeliveryServiceQuery } from './queries/order/order-delivery-service.query';
import { ProductImageQuery } from './queries/product/product-image.query';
import { OrderCallbackPaymentQuery } from './queries/order/order-callback-payment.query';
import { OrderProductQuery } from './queries/order/order-product.query';
import { CustomerProductQuery } from './queries/customer/customer-product.query';
import { CustomerVoucherQuery } from './queries/customer/customer-voucher.query';
import { ProductVariantQuery } from './queries/product/product-variant.query';
import { ModelQuery } from './queries/model/model.query';
import { TypeQuery } from './queries/type/type.query';
import { CapacityQuery } from './queries/capacity/capacity.query';
import { TechnicianQuery } from './queries/technician/technician.query';
import { DriverQuery } from './queries/driver/driver.query';

@Module({
  imports: [],
  providers: [
    PrismaService,
    BannerCampaignQuery,
    TestimonialQuery,
    CategoryProductQuery,
    ProductQuery,
    ProductImageQuery,
    CustomerQuery,
    UserManagementQuery,
    CustomerAddressQuery,
    VoucherQuery,
    DeliveryServiceQuery,
    PaymentMethodQuery,
    OrderQuery,
    OrderCallbackPaymentQuery,
    OrderProductQuery,
    CustomerProductQuery,
    CustomerVoucherQuery,
    ProductVariantQuery,
    ModelQuery,
    TypeQuery,
    CapacityQuery,
    TechnicianQuery,
    DriverQuery,
  ],
  exports: [
    PrismaService,
    BannerCampaignQuery,
    TestimonialQuery,
    CategoryProductQuery,
    ProductQuery,
    ProductImageQuery,
    CustomerQuery,
    UserManagementQuery,
    CustomerAddressQuery,
    VoucherQuery,
    DeliveryServiceQuery,
    PaymentMethodQuery,
    OrderQuery,
    OrderCallbackPaymentQuery,
    OrderProductQuery,
    CustomerProductQuery,
    CustomerVoucherQuery,
    ProductVariantQuery,
    ModelQuery,
    TypeQuery,
    CapacityQuery,
    TechnicianQuery,
    DriverQuery,
  ],
})
export class PrismaModule {}
