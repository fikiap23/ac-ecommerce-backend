import { PrismaClient } from '@prisma/client';
import { IUserAdmin } from './interfaces/user-admin.interface';
import * as bcrypt from 'bcrypt';
import { userAdminDatas } from './datas/user-admin.data';
import { orderPaymentMethodDatas } from './datas/payment-method.data';
import { IOrderPaymentMethod } from './interfaces/payment-method.interface';

const prisma = new PrismaClient();

async function seedUserAdmin(data: IUserAdmin[]) {
  for (const d of data) {
    d.password = await bcrypt.hash(d.password, 10);
  }

  if (data.length > 0) {
    const newUserAdmins: IUserAdmin[] = [];

    for (const d of data) {
      const isExist = await prisma.userAdmin.findFirst({
        where: { username: d.username },
      });
      if (isExist) continue;
      newUserAdmins.push(d);
    }

    if (newUserAdmins.length > 0) {
      await prisma.userAdmin.createMany({ data: newUserAdmins });
      console.log(
        `✅ Successfully seeded ${newUserAdmins.length} user admin(s)`,
      );
    }
  }
}

async function seedPaymentMethod(data: IOrderPaymentMethod[]) {
  const names = data.map((d) => d.name);

  await prisma.orderPaymentMethod.deleteMany({
    where: {
      name: {
        notIn: names,
      },
    },
  });

  for (const item of data) {
    const existing = await prisma.orderPaymentMethod.findFirst({
      where: { name: item.name },
    });

    if (!existing) {
      await prisma.orderPaymentMethod.create({ data: item });
      console.log(`✅ Successfully seeded payment method: ${item.name}`);
    }
  }
}

async function main() {
  await seedUserAdmin(userAdminDatas);
  await seedPaymentMethod(orderPaymentMethodDatas);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
