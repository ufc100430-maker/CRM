# PhoneStore CRM

Внутрішня CRM/ERP для мережі магазинів смартфонів — Telegram Bot + Mini App.

**Стек:** Next.js 14 · TypeScript · Tailwind · Prisma · Supabase · grammY

## Структура

```
phonestore-crm/
├── apps/
│   ├── web/          # Next.js Mini App + API
│   └── bot/          # Telegram Bot (grammY)
└── packages/
    ├── db/           # Prisma schema + клієнт
    └── shared/       # Спільні типи, валідатори (Zod)
```

## Швидкий старт

```bash
# 1. Встановити залежності
pnpm install

# 2. Скопіювати env-файл
cp .env.example .env.local
# (заповнити значення)

# 3. Згенерувати Prisma клієнт
pnpm db:generate

# 4. Запушити схему в БД (для разу-init на dev)
pnpm db:push

# 5. Запустити web (Mini App + API)
pnpm dev:web

# 6. У другому терміналі запустити бот
pnpm dev:bot
```

## Документація

- `docs/TZ.md` — повне технічне завдання
- `docs/SETUP.md` — інструкція з налаштування акаунтів
- `docs/PILOT_PLAN.md` — план пілота

## Розгортання

- **Mini App + API:** Vercel (auto-deploy з main)
- **Бот:** Railway (auto-deploy з main)
- **БД, Auth, Storage:** Supabase
