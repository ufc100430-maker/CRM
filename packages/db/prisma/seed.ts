import { PrismaClient, UserRole, ProductCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // 1. Дефолтні налаштування мережі
  await prisma.appSettings.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      defaultBonusFormula: {
        percentRevenue: 1, // 1% від виручки
        percentAccessories: 5, // 5% від суми аксесуарів
        planBonus: 5000, // фіксований бонус за виконання плану
        returnPenalty: 500, // штраф за повернення
      },
      maxSellerDiscount: 5,
      returnWindowDays: 14,
      workingHoursAlert: 30,
    },
    update: {},
  });

  // 2. Перший власник системи
  const ownerUsername = process.env.INITIAL_OWNER_TELEGRAM_USERNAME?.replace(/^@/, '');
  if (ownerUsername) {
    await prisma.user.upsert({
      where: { telegramUsername: ownerUsername },
      create: {
        telegramId: BigInt(0), // буде оновлено при першому вході
        telegramUsername: ownerUsername,
        fullName: 'Власник',
        role: UserRole.OWNER,
        active: true,
      },
      update: {},
    });
    console.log(`  ✓ Owner: @${ownerUsername}`);
  }

  // 3. Демо-магазин (тільки для dev)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.store.upsert({
      where: { id: 'demo-store-1' },
      create: {
        id: 'demo-store-1',
        name: 'Київ-Хрещатик (демо)',
        address: 'вул. Хрещатик, 22, Київ',
        phone: '+380441234567',
        lat: 50.4501,
        lng: 30.5234,
      },
      update: {},
    });
    console.log('  ✓ Demo store created');
  }

  // 4. Дефолтні шаблони чек-листів
  const openingTemplate = await prisma.checklistTemplate.upsert({
    where: { id: 'default-opening' },
    create: {
      id: 'default-opening',
      type: 'OPENING',
      name: 'Стандартне відкриття магазину',
      items: {
        create: [
          { order: 1, text: 'Світло увімкнено' },
          { order: 2, text: 'Сигналізація знята' },
          { order: 3, text: 'Каса 0 ₴', requirePhoto: true },
          { order: 4, text: 'Фото вітрини', requirePhoto: true, requireLocation: true },
          { order: 5, text: 'Чистота торгового залу' },
          { order: 6, text: 'Цінники на місці' },
        ],
      },
    },
    update: {},
  });

  await prisma.checklistTemplate.upsert({
    where: { id: 'default-closing' },
    create: {
      id: 'default-closing',
      type: 'CLOSING',
      name: 'Стандартне закриття магазину',
      items: {
        create: [
          { order: 1, text: 'Каса перерахована' },
          { order: 2, text: 'Виручка зафіксована', requirePhoto: true },
          { order: 3, text: 'Інкасація проведена' },
          { order: 4, text: 'Сигналізація увімкнена' },
          { order: 5, text: 'Світло вимкнено' },
          { order: 6, text: 'Магазин закрито' },
        ],
      },
    },
    update: {},
  });
  console.log('  ✓ Checklist templates');

  console.log('✅ Done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
