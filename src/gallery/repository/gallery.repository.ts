import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomError } from 'helpers/http.helper';
import { GalleryQuery } from 'src/prisma/queries/gallery/gallery.query';
import * as fs from 'fs/promises';
import * as path from 'path';
import { genIdPrefixTimestamp, genSlug } from 'helpers/data.helper';

@Injectable()
export class GalleryRepository {
  constructor(private readonly galleryQuery: GalleryQuery) {}

  /*
    |--------------------------------------------------------------------------
    | Gallery Repository
    |--------------------------------------------------------------------------
    */

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.GalleryCreateInput;
  }) {
    return this.galleryQuery.create({
      tx,
      data,
    });
  }

  async createMany({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: Prisma.GalleryCreateManyInput[];
  }) {
    return this.galleryQuery.createMany({
      tx,
      data,
    });
  }

  async getThrowById({
    tx,
    id,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    select?: Prisma.GallerySelect;
  }) {
    const result = await this.galleryQuery.findById({
      tx,
      id,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Gallery Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.GallerySelect;
  }) {
    const result = await this.galleryQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Gallery Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async updateById({
    tx,
    id,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    id: number;
    data: Prisma.GalleryUpdateInput;
  }) {
    return this.galleryQuery.update({
      tx,
      id,
      data,
    });
  }

  async deleteById({ tx, id }: { tx?: Prisma.TransactionClient; id: number }) {
    return this.galleryQuery.delete({ tx, id });
  }

  async getMany({
    tx,
    where,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    where?: Prisma.GalleryWhereInput;
    select?: Prisma.GallerySelect;
  }) {
    return await this.galleryQuery.findMany({ tx, where, select });
  }

  async getManyPaginate({
    tx,
    filter,
    select,
    where,
  }: {
    tx?: Prisma.TransactionClient;
    filter: { sort: Prisma.SortOrder; page: number; limit: number };
    select?: Prisma.GallerySelect;
    where?: Prisma.GalleryWhereInput;
  }) {
    const { sort, page, limit } = filter;

    return await this.galleryQuery.findManyPaginate({
      tx,
      where,
      orderBy: { createdAt: sort },
      select,
      page,
      limit,
    });
  }

  async uploadImage(image: Express.Multer.File) {
    // Buat nama file unik
    const ext = path.extname(image.originalname) || '';
    const base = genSlug(image.originalname.replace(ext, ''));
    const fileName = `${genIdPrefixTimestamp(base)}${ext.toLowerCase()}`;

    // Simpan ke filesystem di bawah /public/upload/...
    const fsDir = path.join(
      process.cwd(),
      'public',
      'upload',
      'gallery',
      'images',
    );
    const absPath = path.join(fsDir, fileName);

    await fs.mkdir(fsDir, { recursive: true });

    // Ambil konten dari buffer (memoryStorage) atau dari path (diskStorage)
    const content =
      image.buffer ?? (image.path ? await fs.readFile(image.path) : null);

    if (!content) {
      throw new Error('Tidak ada konten file yang bisa disimpan.');
    }

    await fs.writeFile(absPath, content);

    // Kembalikan URL relatif tanpa prefix /public
    const urlPath = `/upload/gallery/images/${fileName}`;
    return urlPath;
  }

  async deleteImage(image: string) {
    if (!image) return;

    // Ambil pathname kalau full URL, atau pakai apa adanya kalau relatif
    let rel = image;
    try {
      if (/^https?:\/\//i.test(image)) {
        const u = new URL(image);
        rel = u.pathname; // contoh: /upload/gallery/images/xxx.jpg
      }
    } catch {
      // abaikan parsing URL jika gagal
    }

    // Pastikan diawali slash
    if (!rel.startsWith('/')) rel = `/${rel}`;

    // Validasi harus berada di bawah /upload/
    const UPLOAD_PREFIX = '/upload/';
    if (!rel.startsWith(UPLOAD_PREFIX)) {
      throw new Error('Path gambar tidak valid (bukan di /upload/).');
    }

    // Map ke path filesystem di bawah public
    const publicDir = path.join(process.cwd(), 'public'); // .../public
    const fsPath = path.join(publicDir, rel.replace(/^\//, '')); // public/upload/...

    // Normalisasi & cegah path traversal
    const normalized = path.normalize(fsPath);
    if (!normalized.startsWith(publicDir + path.sep)) {
      throw new Error('Path traversal terdeteksi.');
    }

    // Hapus file (abaikan jika tidak ada)
    try {
      await fs.unlink(normalized);
    } catch (err: any) {
      if (err?.code === 'ENOENT') return; // file sudah tidak ada, aman
      throw err;
    }
  }
}
