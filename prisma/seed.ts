import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

import { userAdminDatas } from './datas/user-admin.data';
import { orderPaymentMethodDatas } from './datas/payment-method.data';
import { IUserAdmin } from './interfaces/user-admin.interface';
import { IOrderPaymentMethod } from './interfaces/payment-method.interface';

import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';

const prisma = new PrismaClient();
const BATCH_SIZE = 1000;

/* ===========================
   HELPER
=========================== */
function loadJson<T = any[]>(fileName: string): T {
  const filePath = path.join(__dirname, 'datas', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/* ===========================
   USER ADMIN
=========================== */
async function seedUserAdmin(data: IUserAdmin[]) {
  const toInsert: IUserAdmin[] = [];

  for (const d of data) {
    if (!d.password || typeof d.password !== 'string') {
      console.warn(`⚠️ Skip admin ${d.username} (password kosong)`);
      continue;
    }

    const exists = await prisma.userAdmin.findFirst({
      where: { username: d.username },
    });
    if (exists) continue;

    toInsert.push({
      ...d,
      password: await bcrypt.hash(d.password, 10),
    });
  }

  if (toInsert.length) {
    await prisma.userAdmin.createMany({ data: toInsert });
    console.log(`✅ Seeded ${toInsert.length} user admin`);
  }
}

/* ===========================
   PAYMENT METHOD
=========================== */
async function seedPaymentMethod(data: IOrderPaymentMethod[]) {
  const names = data.map((d) => d.name);

  await prisma.orderPaymentMethod.deleteMany({
    where: { name: { notIn: names } },
  });

  for (const item of data) {
    const exists = await prisma.orderPaymentMethod.findFirst({
      where: { name: item.name },
    });

    if (!exists) {
      await prisma.orderPaymentMethod.create({ data: item });
      console.log(`✅ Seeded payment method: ${item.name}`);
    }
  }
}

/* ===========================
   PROVINCES
=========================== */
async function seedProvinces() {
  const provinces = loadJson<any[]>('provinces.json');

  await prisma.province.createMany({
    data: provinces.map((p) => ({
      code: String(p.code),
      name: p.name,
    })),
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${provinces.length} provinces`);
}

/* ===========================
   REGENCIES
=========================== */
async function seedRegencies() {
  const regencies = loadJson<any[]>('regencies.json');

  await prisma.regency.createMany({
    data: regencies.map((r) => ({
      code: String(r.code),
      name: r.name,
      provinceCode: String(r.provinceCode),
    })),
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${regencies.length} regencies`);
}

/* ===========================
   DISTRICTS
=========================== */
async function seedDistricts() {
  const districts = loadJson<any[]>('districts.json');

  await prisma.district.createMany({
    data: districts.map((d) => ({
      code: String(d.code),
      name: d.name,
      regencyCode: String(d.regencyCode),
    })),
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${districts.length} districts`);
}

/* ===========================
   ISLANDS
=========================== */
async function seedIslands() {
  const islands = loadJson<any[]>('islands.json');

  await prisma.island.createMany({
    data: islands.map((i) => ({
      code: String(i.code),
      name: i.name,
      coordinate: i.coordinate,
      isPopulated: Boolean(i.isPopulated),
      isOutermostSmall: Boolean(i.isOutermostSmall),
      regencyCode: i.regencyCode ? String(i.regencyCode) : null,
    })),
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${islands.length} islands`);
}

/* ===========================
   VILLAGES (JUTAAN DATA)
=========================== */
async function seedVillages() {
  const filePath = path.join(__dirname, 'datas', 'villages.json');

  const pipeline = chain([
    fs.createReadStream(filePath),
    parser(),
    streamArray(),
  ]);

  const batch: any[] = [];
  let total = 0;

  for await (const { value } of pipeline) {
    batch.push({
      code: String(value.code),
      name: value.name,
      districtCode: String(value.districtCode),
    });

    if (batch.length === BATCH_SIZE) {
      await prisma.village.createMany({
        data: batch,
        skipDuplicates: true,
      });

      total += batch.length;
      batch.length = 0;

      if (total % 100_000 === 0) {
        console.log(`🚀 Seeded ${total} villages`);
      }
    }
  }

  if (batch.length) {
    await prisma.village.createMany({
      data: batch,
      skipDuplicates: true,
    });
    total += batch.length;
  }

  console.log(`✅ Seeded ${total} villages`);
}

/* ===========================
   MAIN
=========================== */
async function main() {
  await seedUserAdmin(userAdminDatas);
  await seedPaymentMethod(orderPaymentMethodDatas);

  await seedProvinces();
  await seedRegencies();
  await seedDistricts();
  await seedIslands();
  await seedVillages();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 SEED COMPLETED');
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
