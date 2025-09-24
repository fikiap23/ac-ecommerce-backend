import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from 'src/gateway/gateway.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductRepository } from './repositories/product.repository';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { CategoryProductRepository } from './repositories/category-product.repository';
import { ProductImageRepository } from './repositories/product-image.repository';
import { CategoryProductService } from './services/category-product.service';
import { ProductValidateRepository } from './repositories/product-validate.repository';
import { ProductVariantRepository } from './repositories/product-variant.repository';
import { ModelRepository } from './repositories/model.repository';
import { TypeRepository } from './repositories/type.repository';
import { CapacityRepository } from './repositories/capacity.repository';
import { TypeService } from './services/type.service';
import { ModelService } from './services/model.service';
import { CapacityService } from './services/capacity.service';
import { ModelController } from './controllers/model.controller';
import { TypeController } from './controllers/type.controller';
import { CapacityController } from './controllers/capacity.controller';
import { BundleRepository } from './repositories/bundle.repository';

@Module({
  imports: [
    JwtModule.register({}),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule,
    GatewayModule,
  ],
  providers: [
    ProductRepository,
    ProductValidateRepository,
    CategoryProductRepository,
    ProductImageRepository,
    ProductService,
    CategoryProductService,
    ProductVariantRepository,
    ModelRepository,
    TypeRepository,
    CapacityRepository,
    TypeService,
    ModelService,
    CapacityService,
    BundleRepository,
  ],
  controllers: [
    ProductController,
    ModelController,
    TypeController,
    CapacityController,
  ],
  exports: [
    ProductService,
    ProductRepository,
    ProductVariantRepository,
    ModelRepository,
    TypeRepository,
    CapacityRepository,
    TypeService,
    ModelService,
    CapacityService,
    BundleRepository,
  ],
})
export class ProductModule {}
