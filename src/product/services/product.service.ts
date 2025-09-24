import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import {
  CreateProductDto,
  RemoveVariantDto,
  UpdateProductDto,
} from '../dto/product.dto';
import {
  IFilterProduct,
  ISelectGeneralProduct,
} from '../interfaces/product.interface';
import { CategoryProductRepository } from '../repositories/category-product.repository';
import { Prisma, ProductVariant } from '@prisma/client';
import {
  selectGeneralProduct,
  selectGenerealBundle,
} from 'src/prisma/queries/product/props/select-product.prop';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomError } from 'helpers/http.helper';
import { ModelRepository } from '../repositories/model.repository';
import { CapacityRepository } from '../repositories/capacity.repository';
import { TypeRepository } from '../repositories/type.repository';
import {
  assertImages,
  deleteFilesBestEffort,
  saveImages,
  urlToAbs,
} from 'helpers/helper';
import { parseFormBoolean } from 'helpers/data.helper';

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryProductRepository: CategoryProductRepository,
    private readonly productRepository: ProductRepository,
    private readonly prisma: PrismaService,
    private readonly modelRepository: ModelRepository,
    private readonly capacityRepository: CapacityRepository,
    private readonly typeRepository: TypeRepository,
  ) {}

  async create(dto: CreateProductDto) {
    const {
      packageType,
      serviceType,
      variants,
      typeUuid,
      modelUuid,
      capacityUuid,
    } = dto;

    // === VALIDASI RELASI ===
    let typeConnect: any = undefined;
    let modelConnect: any = undefined;
    let capacityConnect: any = undefined;
    let categoryProductConnect: any = undefined;

    if (typeUuid) {
      await this.typeRepository.getThrowByUuid({ uuid: typeUuid });
      typeConnect = { connect: { uuid: typeUuid } };
    }
    if (modelUuid) {
      await this.modelRepository.getThrowByUuid({ uuid: modelUuid });
      modelConnect = { connect: { uuid: modelUuid } };
    }
    if (capacityUuid) {
      await this.capacityRepository.getThrowByUuid({ uuid: capacityUuid });
      capacityConnect = { connect: { uuid: capacityUuid } };
    }
    if (dto.categoryProductUuid && packageType !== 'BUNDLE') {
      await this.categoryProductRepository.getThrowByUuid({
        uuid: dto.categoryProductUuid,
      });
      categoryProductConnect = { connect: { uuid: dto.categoryProductUuid } };
    }

    // ============ FILE HANDLING RAPIH ============
    // kumpulkan path untuk rollback jika DB gagal
    const allAbsToCleanup: string[] = [];

    const productImages = dto.productImages ?? [];
    const variantImages = (variants ?? []).map((v) => v.image ?? []);

    let productImageRows: { url: string }[] | undefined = undefined;
    let variantPhotoUrls: (string | null)[] | undefined = undefined;
    let bundleImageRows: { url: string }[] | undefined = undefined;

    if (packageType === 'SINGLE') {
      // validasi
      assertImages(productImages);
      variantImages.forEach(assertImages);

      // simpan gambar produk
      const savedProductImages = await saveImages(
        productImages,
        'upload/product/productImage',
        'Product Image',
      );
      productImageRows = savedProductImages.map((s) => ({ url: s.url }));
      allAbsToCleanup.push(...savedProductImages.map((s) => s.absPath));

      const savedVariantImages = await Promise.all(
        variantImages.map((imgs) =>
          saveImages(imgs, 'upload/product/variantImage', 'Variant Image'),
        ),
      );
      variantPhotoUrls = savedVariantImages.map((arr) =>
        arr.length ? arr[0].url : null,
      );
      allAbsToCleanup.push(...savedVariantImages.flat().map((s) => s.absPath));
    } else if (packageType === 'BUNDLE') {
      // validasi
      assertImages(productImages);

      // simpan gambar bundle
      const savedBundleImages = await saveImages(
        productImages,
        'upload/bundle/bundleImage',
        'Bundle Image',
      );
      bundleImageRows = savedBundleImages.map((s) => ({ url: s.url }));
      allAbsToCleanup.push(...savedBundleImages.map((s) => s.absPath));
    }

    try {
      switch (packageType) {
        case 'SINGLE': {
          if (serviceType === 'SERVICE') {
            const created = await this.prisma.$transaction(async (tx) => {
              return tx.product.create({
                data: {
                  name: dto.name,
                  description: dto.description,
                  brand: dto.brand,
                  price: dto.price,
                  salePrice: dto.salePrice ?? null,
                  packageType,
                  serviceType,
                  isActive: parseFormBoolean(dto.isActive),
                  isHide: parseFormBoolean(dto.isHide),
                  rating: parseFloat(dto.rating ?? '0'),
                  type: typeConnect,
                  model: modelConnect,
                  capacity: capacityConnect,
                  categoryProduct: categoryProductConnect,
                  productImage:
                    (productImageRows?.length ?? 0) > 0
                      ? { create: productImageRows }
                      : undefined,
                },
              });
            });
            return created;
          }

          const created = await this.prisma.$transaction(async (tx) => {
            return tx.product.create({
              data: {
                name: dto.name,
                brand: dto.brand,
                description: dto.description,
                price: dto.price,
                salePrice: dto.salePrice ?? null,
                packageType,
                serviceType,
                isActive: parseFormBoolean(dto.isActive),
                isHide: parseFormBoolean(dto.isHide),
                rating: parseFloat(dto.rating ?? '0'),
                type: typeConnect,
                model: modelConnect,
                capacity: capacityConnect,
                categoryProduct: categoryProductConnect,
                productImage:
                  (productImageRows?.length ?? 0) > 0
                    ? { create: productImageRows }
                    : undefined,
                productVariant:
                  (variants?.length ?? 0) > 0
                    ? {
                        create: variants!.map((v, idx) => ({
                          name: v.name,
                          code: v.code,
                          stock: v.stock,
                          regularPrice: v.regularPrice,
                          salePrice: v.salePrice ?? null,
                          specification: v.specification ?? null,
                          photoUrl: variantPhotoUrls?.[idx] || null,
                        })),
                      }
                    : undefined,
              },
            });
          });
          return created;
        }

        case 'BUNDLE': {
          if (!dto.bundlingItems?.length) {
            throw new CustomError({
              message: 'Bundling items wajib diisi',
              statusCode: 400,
            });
          }

          const products = await this.prisma.product.findMany({
            where: {
              uuid: { in: dto.bundlingItems.map((i) => i.productUuid) },
            },
            select: { id: true, uuid: true, price: true },
          });
          if (products.length !== dto.bundlingItems.length) {
            throw new CustomError({
              message: 'Bundling items tidak valid',
              statusCode: 400,
            });
          }

          const totalProductPrice = products.reduce(
            (sum, p) => sum + p.price,
            0,
          );
          const finalPrice = totalProductPrice - (dto.bundlingMinusPrice ?? 0);

          const bundle = await this.prisma.$transaction(async (tx) => {
            return tx.bundle.create({
              data: {
                name: dto.name,
                description: dto.description,
                minusPrice: dto.bundlingMinusPrice ?? null,
                isActive: parseFormBoolean(dto.isActive),
                isHide: parseFormBoolean(dto.isHide),
                price: finalPrice,
                rating: parseFloat(dto.rating ?? '0'),
                bundleImage:
                  (bundleImageRows?.length ?? 0) > 0
                    ? { create: bundleImageRows }
                    : undefined,
                items: {
                  createMany: {
                    data: products.map((p) => ({ productId: p.id })),
                  },
                },
              },
              include: {
                items: {
                  include: {
                    product: {
                      select: { uuid: true, name: true, price: true },
                    },
                  },
                },
              },
            });
          });

          return bundle;
        }

        default:
          throw new CustomError({
            message: 'Tipe produk tidak valid',
            statusCode: 400,
          });
      }
    } catch (e) {
      // jika DB gagal → hapus file yang sudah tersimpan
      await deleteFilesBestEffort(allAbsToCleanup);
      throw e;
    }
  }

  async getAll(filter: IFilterProduct) {
    return await this.productRepository.getManyPaginate({
      filter,
      select: selectGeneralProduct,
    });
  }

  async getByUuid(uuid: string) {
    const product = await this.productRepository.getThrowProductOrBundleByUuid({
      uuid,
      selectProduct: selectGeneralProduct,
      selectBundle: selectGenerealBundle,
    });

    return {
      ...product,
    };
  }

  async updateProductByUuid(uuid: string, dto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { uuid },
      include: {
        productImage: true,
        productVariant: true,
      },
    });

    console.log('rating', dto.rating);

    const existingBundle = !existingProduct
      ? await this.prisma.bundle.findUnique({
          where: { uuid },
          include: {
            bundleImage: true,
            items: {
              include: { product: { select: { id: true, price: true } } },
            },
          },
        })
      : null;

    if (!existingProduct && !existingBundle) {
      throw new CustomError({
        message: 'Produk tidak ditemukan',
        statusCode: 404,
      });
    }

    const isSingle = !!existingProduct;
    const isBundle = !!existingBundle;

    // ===== Validasi relasi opsional =====
    let typeConnect: any = undefined;
    let modelConnect: any = undefined;
    let capacityConnect: any = undefined;
    let categoryProductConnect: any = undefined;

    if (dto.typeUuid) {
      await this.typeRepository.getThrowByUuid({ uuid: dto.typeUuid });
      typeConnect = { connect: { uuid: dto.typeUuid } };
    }
    if (dto.modelUuid) {
      await this.modelRepository.getThrowByUuid({ uuid: dto.modelUuid });
      modelConnect = { connect: { uuid: dto.modelUuid } };
    }
    if (dto.capacityUuid) {
      await this.capacityRepository.getThrowByUuid({ uuid: dto.capacityUuid });
      capacityConnect = { connect: { uuid: dto.capacityUuid } };
    }
    if (isSingle && dto.categoryProductUuid) {
      await this.categoryProductRepository.getThrowByUuid({
        uuid: dto.categoryProductUuid,
      });
      categoryProductConnect = { connect: { uuid: dto.categoryProductUuid } };
    }

    // ===== FILE HANDLING =====
    const allAbsToCleanup: string[] = [];

    // ===== HANDLE IMAGE DELETION =====
    const imagesToDelete: string[] = [];
    let imageDeleteData: any = undefined;

    if (
      dto.productImageData &&
      Array.isArray(dto.productImageData) &&
      dto.productImageData.length > 0
    ) {
      // Validasi bahwa gambar yang akan dihapus ada di database
      if (isSingle && existingProduct) {
        const existingImageUuids = existingProduct.productImage.map(
          (img) => img.uuid,
        );
        const deleteUuids = dto.productImageData.map((img) => img.uuid);

        // Filter hanya UUID yang benar-benar ada
        const validDeleteUuids = deleteUuids.filter((uuid) =>
          existingImageUuids.includes(uuid),
        );

        if (validDeleteUuids.length > 0) {
          // Collect file paths untuk dihapus dari storage
          const imagesToDeleteFromStorage = existingProduct.productImage
            .filter((img) => validDeleteUuids.includes(img.uuid))
            .map((img) => urlToAbs(img.url));

          imagesToDelete.push(...imagesToDeleteFromStorage);

          // Setup delete operation untuk database
          imageDeleteData = {
            deleteMany: {
              uuid: { in: validDeleteUuids },
            },
          };
        }
      }

      if (isBundle && existingBundle) {
        const existingImageUuids = existingBundle.bundleImage.map(
          (img) => img.uuid,
        );
        const deleteUuids = dto.productImageData.map((img) => img.uuid);

        // Filter hanya UUID yang benar-benar ada
        const validDeleteUuids = deleteUuids.filter((uuid) =>
          existingImageUuids.includes(uuid),
        );

        if (validDeleteUuids.length > 0) {
          // Collect file paths untuk dihapus dari storage
          const imagesToDeleteFromStorage = existingBundle.bundleImage
            .filter((img) => validDeleteUuids.includes(img.uuid))
            .map((img) => urlToAbs(img.url));

          imagesToDelete.push(...imagesToDeleteFromStorage);

          // Setup delete operation untuk database
          imageDeleteData = {
            deleteMany: {
              uuid: { in: validDeleteUuids },
            },
          };
        }
      }
    }

    // Galeri (produk/bundle) - untuk gambar baru
    const productImages = dto.productImages ?? [];
    assertImages(productImages);

    let productImageRows: { url: string }[] | undefined;
    let bundleImageRows: { url: string }[] | undefined;

    if (isSingle && productImages.length) {
      const saved = await saveImages(
        productImages,
        'upload/product/productImage',
        'Product Image',
      );
      productImageRows = saved.map((s) => ({ url: s.url }));
      allAbsToCleanup.push(...saved.map((s) => s.absPath));
    }
    if (isBundle && productImages.length) {
      const saved = await saveImages(
        productImages,
        'upload/bundle/bundleImage',
        'Bundle Image',
      );
      bundleImageRows = saved.map((s) => ({ url: s.url }));
      allAbsToCleanup.push(...saved.map((s) => s.absPath));
    }

    // Varian (SINGLE PRODUCT): proses per varian
    type VariantUpdatePlan = {
      kind: 'create' | 'update';
      uuid?: string;
      data: Omit<Prisma.ProductVariantCreateWithoutProductInput, 'product'> & {
        photoUrl?: string | null;
      };
      // untuk hapus file lama jika ganti foto
      oldPhotoAbs?: string | null;
    };

    const variantPlans: VariantUpdatePlan[] = [];

    if (isSingle) {
      const targetServiceType = dto.serviceType ?? existingProduct!.serviceType;
      const isService = targetServiceType === 'SERVICE';

      if (!isService && Array.isArray(dto.variants) && dto.variants.length) {
        // Map existing variants by uuid untuk lookup cepat
        const existingByUuid = new Map<string, ProductVariant>();
        existingProduct!.productVariant.forEach((pv) =>
          existingByUuid.set(pv.uuid, pv),
        );

        // Siapkan rencana per varian
        for (let i = 0; i < dto.variants.length; i++) {
          const v = dto.variants[i];

          // Validasi & simpan image varian (ambil 1st)
          let newPhotoUrl: string | null | undefined = undefined;
          if (v.image?.length) {
            assertImages(v.image);
            const saved = await saveImages(
              v.image,
              'upload/product/variantImage',
              'Variant Image',
            );
            allAbsToCleanup.push(...saved.map((s) => s.absPath));
            newPhotoUrl = saved[0]?.url ?? null;
          }

          if (v.uuid && existingByUuid.has(v.uuid)) {
            const current = existingByUuid.get(v.uuid)!;
            variantPlans.push({
              kind: 'update',
              uuid: v.uuid,
              data: {
                name: v.name ?? undefined,
                code: v.code ?? undefined,
                stock: v.stock ?? undefined,
                regularPrice: v.regularPrice ?? undefined,
                salePrice: v.salePrice ?? undefined,
                specification: v.specification ?? undefined,
                photoUrl: newPhotoUrl ?? undefined, // set hanya jika ada foto baru
              },
              oldPhotoAbs: newPhotoUrl ? urlToAbs(current.photoUrl) : null,
            });
          } else {
            // create varian baru
            variantPlans.push({
              kind: 'create',
              data: {
                name: v.name!,
                code: v.code!,
                stock: v.stock!,
                regularPrice: v.regularPrice!,
                salePrice: v.salePrice ?? null,
                specification: v.specification ?? null,
                photoUrl: newPhotoUrl ?? null,
              },
            });
          }
        }
      }
    }

    // ===== TRANSAKSI =====
    try {
      if (isSingle) {
        const updated = await this.prisma.$transaction(async (tx) => {
          // 1) update produk dasar
          const dataProduct: Prisma.ProductUpdateInput = {
            name: dto.name ?? undefined,
            brand: dto.brand ?? undefined,
            description: dto.description ?? undefined,
            price: dto.price ?? undefined,
            salePrice: dto.salePrice ?? undefined,
            rating: parseFloat(dto.rating ?? '0'),
            isActive: parseFormBoolean(dto.isActive),
            isHide: parseFormBoolean(dto.isHide),
            serviceType: dto.serviceType ?? undefined,
            type: typeConnect,
            model: modelConnect,
            capacity: capacityConnect,
            categoryProduct: categoryProductConnect,
            productImage: {
              ...(imageDeleteData ? imageDeleteData : {}),
              ...((productImageRows?.length ?? 0) > 0
                ? { create: productImageRows }
                : {}),
            },
          };

          const prod = await tx.product.update({
            where: { uuid },
            data: dataProduct,
          });

          // 2) jalankan rencana varian (kalau ada)
          for (const plan of variantPlans) {
            if (plan.kind === 'update' && plan.uuid) {
              await tx.productVariant.update({
                where: { uuid: plan.uuid },
                data: plan.data as Prisma.ProductVariantUpdateInput,
              });
            } else if (plan.kind === 'create') {
              await tx.productVariant.create({
                data: {
                  ...(plan.data as Prisma.ProductVariantCreateWithoutProductInput),
                  product: { connect: { id: prod.id } },
                },
              });
            }
          }

          return prod;
        });

        // 3) hapus foto lama varian (yang diganti), best-effort
        const oldToDelete = variantPlans
          .map((p) => p.oldPhotoAbs)
          .filter((x): x is string => !!x);
        if (oldToDelete.length) await deleteFilesBestEffort(oldToDelete);

        // 4) hapus gambar yang diminta untuk dihapus
        if (imagesToDelete.length) {
          await deleteFilesBestEffort(imagesToDelete);
        }

        return updated;
      }

      // ===== BUNDLE =====
      if (isBundle) {
        // jika items dikirim → hitung ulang harga
        let itemsData:
          | {
              deleteMany: Prisma.ProductBundleItemScalarWhereInput[];
              createMany: { data: { productId: number }[] };
            }
          | undefined;
        let newPrice: number | undefined;

        if (dto.bundlingItems && dto.bundlingItems.length) {
          const products = await this.prisma.product.findMany({
            where: {
              uuid: { in: dto.bundlingItems.map((i) => i.productUuid) },
            },
            select: { id: true, price: true },
          });
          if (products.length !== dto.bundlingItems.length) {
            throw new CustomError({
              message: 'Produk tidak ditemukan',
              statusCode: 404,
            });
          }
          const minus =
            dto.bundlingMinusPrice ?? existingBundle!.minusPrice ?? 0;
          newPrice = products.reduce((s, p) => s + p.price, 0) - minus;

          itemsData = {
            deleteMany: [{ bundleId: existingBundle!.id }],
            createMany: { data: products.map((p) => ({ productId: p.id })) },
          };
        } else if (typeof dto.bundlingMinusPrice === 'number') {
          // minus price berubah tapi items tetap → hitung ulang dari items existing
          const sum = existingBundle!.items.reduce(
            (s, it) => s + it.product.price,
            0,
          );
          newPrice = sum - dto.bundlingMinusPrice;
        }

        const updated = await this.prisma.$transaction(async (tx) => {
          return tx.bundle.update({
            where: { uuid },
            data: {
              name: dto.name ?? undefined,
              description: dto.description ?? undefined,
              minusPrice: dto.bundlingMinusPrice ?? undefined,
              isActive: parseFormBoolean(dto.isActive),
              isHide: parseFormBoolean(dto.isHide),
              price: typeof newPrice === 'number' ? newPrice : undefined,
              rating: parseFloat(dto.rating ?? '0'),
              bundleImage: {
                ...(imageDeleteData ? imageDeleteData : {}),
                ...((bundleImageRows?.length ?? 0) > 0
                  ? { create: bundleImageRows }
                  : {}),
              },
              items: itemsData,
            },
            include: {
              items: {
                include: {
                  product: { select: { uuid: true, name: true, price: true } },
                },
              },
            },
          });
        });

        // Hapus gambar bundle yang diminta untuk dihapus
        if (imagesToDelete.length) {
          await deleteFilesBestEffort(imagesToDelete);
        }

        return updated;
      }

      throw new CustomError({
        message: 'Tipe produk tidak valid',
        statusCode: 400,
      });
    } catch (e) {
      // rollback file baru jika transaksi gagal
      await deleteFilesBestEffort(allAbsToCleanup);
      throw e;
    }
  }

  async deleteByUuid(uuid: string) {
    await this.productRepository.getThrowByUuid({ uuid });

    return await this.productRepository.updateByUuid({
      uuid,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async removeVariantByUuid(dto: RemoveVariantDto) {
    const product = await this.productRepository.getThrowByUuid({
      uuid: dto.uuidProduct,
      select: {
        uuid: true,
        id: true,
        productVariant: {
          select: {
            uuid: true,
            id: true,
          },
        },
      },
    });

    if (
      product.productVariant.find((v) => v.uuid === dto.uuidVariant) ===
      undefined
    ) {
      throw new CustomError({
        message: 'Variant tidak ditemukan',
        statusCode: 404,
      });
    }

    await this.prisma.productVariant.delete({
      where: { uuid: dto.uuidVariant },
    });

    return product;
  }
}
