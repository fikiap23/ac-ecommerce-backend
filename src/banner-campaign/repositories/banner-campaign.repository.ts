import { Injectable } from '@nestjs/common';
import { BannerCampaignQuery } from 'src/prisma/queries/banner-campaign/banner-campaign.query';
import {
  ICreateBannerCampaign,
  IFilterBannerCampaign,
  IUpdateBannerCampaign,
} from '../interfaces/banner-campaign.interface';
import { Prisma } from '@prisma/client';
import { whereBannerCampaignGetManyPaginate } from 'src/prisma/queries/banner-campaign/props/where-banner-campaign.prop';
import { CustomError } from 'helpers/http.helper';
import { GatewayService } from 'src/gateway/services/gateway.service';
import { genIdPrefixTimestamp, genSlug } from 'helpers/data.helper';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class BannerCampaignRepository {
  constructor(
    private readonly bannerCampaignQuery: BannerCampaignQuery,
    private readonly gatewayService: GatewayService,
  ) {}

  /*
    |--------------------------------------------------------------------------
    | Banner Campaign Repository
    |--------------------------------------------------------------------------
    */

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
      'banner-campaign',
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
    const urlPath = `/upload/banner-campaign/images/${fileName}`;
    return urlPath;
  }

  async deleteImage(image: string) {
    if (!image) return;

    // Ambil pathname kalau full URL, atau pakai apa adanya kalau relatif
    let rel = image;
    try {
      if (/^https?:\/\//i.test(image)) {
        const u = new URL(image);
        rel = u.pathname; // contoh: /upload/banner-campaign/images/xxx.jpg
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

  async create({
    tx,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    data: ICreateBannerCampaign;
  }) {
    return await this.bannerCampaignQuery.create({
      tx,
      data,
    });
  }

  async getManyPaginate({
    tx,
    filter,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    filter: IFilterBannerCampaign;
    select?: Prisma.BannerCampaignSelect;
  }) {
    const { sort, page, limit } = filter;

    const { where } = whereBannerCampaignGetManyPaginate(filter);

    return await this.bannerCampaignQuery.findManyPaginate({
      tx,
      where,
      select,
      orderBy: { createdAt: sort },
      page,
      limit,
    });
  }

  async getThrowByUuid({
    tx,
    uuid,
    select,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    select?: Prisma.BannerCampaignSelect;
  }) {
    const result = await this.bannerCampaignQuery.findByUuid({
      tx,
      uuid,
      select,
    });

    if (!result) {
      throw new CustomError({
        message: 'Banner Campaign Tidak Ditemukan!',
        statusCode: 404,
      });
    }

    return result;
  }

  async updateByUuid({
    tx,
    uuid,
    data,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
    data: IUpdateBannerCampaign;
  }) {
    return await this.bannerCampaignQuery.updateByUuid({
      tx,
      uuid,
      data,
    });
  }

  async deleteByUuid({
    tx,
    uuid,
  }: {
    tx?: Prisma.TransactionClient;
    uuid: string;
  }) {
    return await this.bannerCampaignQuery.deleteByUuid({ tx, uuid });
  }
}
