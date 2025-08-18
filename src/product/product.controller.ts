import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './services/product.service';
import { JwtGuard, RoleGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { TypeRoleAdmin } from '@prisma/client';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  CreateProductDto,
  QueryProductDto,
  UpdateProductDto,
} from './dto/product.dto';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler, imageFileFilter } from 'helpers/validation.helper';
import { Response } from 'express';
import {
  CreateCategoryProductDto,
  QueryCategoryProductDto,
  UpdateCategoryProductDto,
} from './dto/category-product.dto';
import { CategoryProductService } from './services/category-product.service';

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryProductService: CategoryProductService,
  ) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post('product')
  @UseInterceptors(
    AnyFilesInterceptor({
      fileFilter: imageFileFilter,
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    }),
  )
  async createProduct(
    @Body() dto: CreateProductDto,
    @Res() res: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      // === Extract and map variant images from files ===
      const variantImagesMap = {} as Record<number, Express.Multer.File[]>;

      for (const file of files) {
        const variantMatch = file.fieldname.match(/variants\[(\d+)]\[image]/);
        if (variantMatch) {
          const index = +variantMatch[1];
          variantImagesMap[index] = variantImagesMap[index] || [];
          variantImagesMap[index].push(file);
        } else if (file.fieldname === 'productImages') {
          dto.productImages = dto.productImages || [];
          dto.productImages.push(file);
        }
      }

      if (dto.variants && Array.isArray(dto.variants)) {
        dto.variants = dto.variants.map((variant, idx) => {
          return {
            ...variant,
            image: variantImagesMap[idx] || [],
          };
        });
      }

      const result = await this.productService.create(dto);
      return formatResponse(res, HttpStatus.CREATED, result.uuid);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('product')
  async getAllProduct(@Query() queries: QueryProductDto, @Res() res: Response) {
    try {
      const result = await this.productService.getAll(queries);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('product/:uuid')
  async getProductByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.productService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Put('product/:uuid')
  @UseInterceptors(
    AnyFilesInterceptor({
      fileFilter: imageFileFilter,
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    }),
  )
  async updateProductByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateProductDto,
    @Res() res: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      // === Extract and map variant images from files ===
      const variantImagesMap = {} as Record<number, Express.Multer.File[]>;

      for (const file of files) {
        const variantMatch = file.fieldname.match(/variants\[(\d+)]\[image]/);
        if (variantMatch) {
          const index = +variantMatch[1];
          variantImagesMap[index] = variantImagesMap[index] || [];
          variantImagesMap[index].push(file);
        } else if (file.fieldname === 'productImages') {
          dto.productImages = dto.productImages || [];
          dto.productImages.push(file);
        }
      }

      if (dto.variants && Array.isArray(dto.variants)) {
        dto.variants = dto.variants.map((variant, idx) => {
          return {
            ...variant,
            image: variantImagesMap[idx] || [],
          };
        });
      }
      await this.productService.updateProductByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.SUPER_ADMIN)
  @Delete('product/:uuid')
  async deleteProductByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      await this.productService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Post('category-product')
  async createCategory(
    @Body() dto: CreateCategoryProductDto,
    @Res() res: Response,
  ) {
    try {
      await this.categoryProductService.create(dto);
      return formatResponse(res, HttpStatus.CREATED, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('category-product')
  async getAllCategory(
    @Query() queries: QueryCategoryProductDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.categoryProductService.getAll(queries);
      return formatResponse(res, HttpStatus.OK, result.data, result.meta);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @Get('category-product/:uuid')
  async getCategoryByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.categoryProductService.getByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Put('category-product/:uuid')
  async updateCategoryByUuid(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateCategoryProductDto,
    @Res() res: Response,
  ) {
    try {
      await this.categoryProductService.updateByUuid(uuid, dto);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(TypeRoleAdmin.ADMIN, TypeRoleAdmin.SUPER_ADMIN)
  @Delete('category-product/:uuid')
  async deleteCategoryByUuid(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      await this.categoryProductService.deleteByUuid(uuid);
      return formatResponse(res, HttpStatus.OK, null);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}
