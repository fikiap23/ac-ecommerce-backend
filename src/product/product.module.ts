import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from 'src/gateway/gateway.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductRepository } from './repositories/product.repository';
import { ProductService } from './services/product.service';
import { ProductController } from './product.controller';
import { CategoryProductRepository } from './repositories/category-product.repository';
import { ProductImageRepository } from './repositories/product-image.repository';
import { CategoryProductService } from './services/category-product.service';
import { ProductValidateRepository } from './repositories/product-validate.repository';

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
  ],
  controllers: [ProductController],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
