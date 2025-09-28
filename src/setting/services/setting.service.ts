import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SiteSettingRepository } from '../repositories/site-setting.repository';
import { UpsertSettingDto } from '../dto/setting.dto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { genSlug, genIdPrefixTimestamp } from 'helpers/data.helper';

@Injectable()
export class SettingService {
  constructor(private readonly siteRepo: SiteSettingRepository) {}

  private readonly selectSetting: Prisma.SiteSettingSelect = {
    uuid: true,
    logo: true,
    description: true,
    phone: true,
    email: true,
    address: true,
    copyrightText: true,
    createdAt: true,
    updatedAt: true,
    socialMedias: {
      select: {
        uuid: true,
        username: true,
        icon: true,
        url: true,
        order: true,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    },
  };

  async getSetting() {
    const data = await this.siteRepo.getFirst({
      select: this.selectSetting,
      where: {},
    });
    return data ?? null;
  }

  private async saveLocalImage(file: Express.Multer.File) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = genSlug((file.originalname || '').replace(ext, ''));
    const fileName = `${genIdPrefixTimestamp(base)}${ext || ''}`;

    const dir = path.join(process.cwd(), 'public', 'upload', 'site', 'logo');
    await fs.mkdir(dir, { recursive: true });

    const absPath = path.join(dir, fileName);
    const content =
      file.buffer ?? (file.path ? await fs.readFile(file.path) : null);
    if (!content) throw new Error('File kosong');

    await fs.writeFile(absPath, content);
    return `/upload/site/logo/${fileName}`;
  }

  async saveSetting(
    dto: UpsertSettingDto,
    files?: { logo?: Express.Multer.File; socialIcons?: Express.Multer.File[] },
  ) {
    const existing = await this.siteRepo.getFirst({});
    const logoUrl = files?.logo
      ? await this.saveLocalImage(files.logo)
      : undefined;

    const iconUrls = files?.socialIcons?.length
      ? await Promise.all(files.socialIcons.map((f) => this.saveLocalImage(f)))
      : [];

    const socials = (dto.socialMedias ?? []).map((s, i) => ({
      username: s.username,
      icon: iconUrls[i] ?? null,
      url: s.url ?? null,
      order: s.order ?? i,
      isActive: s.isActive ?? true,
    }));

    if (!existing) {
      return this.siteRepo.create({
        data: {
          logo: logoUrl ?? null,
          description: dto.description ?? null,
          phone: dto.phone ?? null,
          email: dto.email ?? null,
          address: dto.address ?? null,
          copyrightText: dto.copyrightText ?? null,
          socialMedias: socials.length ? { create: socials } : undefined,
        } as Prisma.SiteSettingCreateInput,
      });
    }

    return this.siteRepo.updateById({
      id: existing.id,
      data: {
        ...(logoUrl !== undefined ? { logo: logoUrl } : {}),
        description: dto.description,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        copyrightText: dto.copyrightText,
        socialMedias: socials.length
          ? { deleteMany: {}, create: socials }
          : { deleteMany: {} },
      } as Prisma.SiteSettingUpdateInput,
    });
  }
}
