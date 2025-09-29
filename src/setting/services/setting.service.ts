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
    return data;
  }

  private async saveLocalImage(file: Express.Multer.File, subPath: string[]) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = genSlug((file.originalname || '').replace(ext, ''));
    const fileName = `${genIdPrefixTimestamp(base)}${ext || ''}`;
    const dir = path.join(process.cwd(), 'public', 'upload', ...subPath);
    await fs.mkdir(dir, { recursive: true });
    const absPath = path.join(dir, fileName);
    const content =
      file.buffer ?? (file.path ? await fs.readFile(file.path) : null);
    if (!content) throw new Error('File kosong');
    await fs.writeFile(absPath, content);
    return `/upload/${subPath.join('/')}/${fileName}`;
  }

  async saveSetting(
    dto: UpsertSettingDto,
    files?: { logo?: Express.Multer.File; socialIcons?: Express.Multer.File[] },
  ) {
    const existing = await this.siteRepo.getFirst({
      select: { id: true, socialMedias: { select: { uuid: true } } },
    });

    const logoUrl = files?.logo
      ? await this.saveLocalImage(files.logo, ['site', 'logo'])
      : undefined;

    const iconUrls = files?.socialIcons?.length
      ? await Promise.all(
          files.socialIcons.map((f) =>
            this.saveLocalImage(f, ['site', 'social']),
          ),
        )
      : [];

    if (!existing) {
      const socialsForCreate = (dto.socialMedias ?? []).map((s, i) => ({
        username: s.username,
        icon: iconUrls[i],
        url: s.url,
        order: s.order ?? i,
        isActive: s.isActive ?? true,
      }));

      return this.siteRepo.create({
        data: {
          logo: logoUrl,
          description: dto.description,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          copyrightText: dto.copyrightText,
          socialMedias: socialsForCreate.length
            ? { create: socialsForCreate }
            : undefined,
        } as Prisma.SiteSettingCreateInput,
      });
    }

    const existingUuidSet = new Set(
      (existing.socialMedias ?? []).map((s) => s.uuid),
    );

    const updates: Prisma.SettingSocialUpdateWithWhereUniqueWithoutSettingInput[] =
      [];
    const creates: Prisma.SettingSocialCreateWithoutSettingInput[] = [];

    if (dto.socialMedias !== undefined) {
      (dto.socialMedias ?? []).forEach((s, i) => {
        const uploadedIcon = iconUrls[i];
        if (s.uuid && existingUuidSet.has(s.uuid)) {
          updates.push({
            where: { uuid: s.uuid },
            data: {
              username: s.username,
              ...(uploadedIcon !== undefined ? { icon: uploadedIcon } : {}),
              url: s.url,
              order: s.order ?? i,
              isActive: s.isActive ?? true,
            },
          });
        } else {
          // CREATE item baru
          creates.push({
            username: s.username,
            ...(uploadedIcon !== undefined ? { icon: uploadedIcon } : {}),
            url: s.url,
            order: s.order ?? i,
            isActive: s.isActive ?? true,
          });
        }
      });
    }

    const socialOps:
      | Prisma.SettingSocialUpdateManyWithoutSettingNestedInput
      | undefined =
      dto.socialMedias === undefined
        ? undefined
        : {
            ...(updates.length ? { update: updates } : {}),
            ...(creates.length ? { create: creates } : {}),
          };

    return this.siteRepo.updateById({
      id: existing.id,
      data: {
        ...(logoUrl !== undefined ? { logo: logoUrl } : {}),
        description: dto.description,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        copyrightText: dto.copyrightText,
        ...(socialOps ? { socialMedias: socialOps } : {}),
      } as Prisma.SiteSettingUpdateInput,
    });
  }
}
