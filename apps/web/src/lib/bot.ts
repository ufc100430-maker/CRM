/**
 * Telegram бот PhoneStore CRM (webhook-режим).
 * Розгортається разом з Mini App у Next.js. Telegram надсилає updates на
 * /api/bot/webhook — звідти hadnler передає в цей же Bot instance.
 *
 * Локально для розробки можна тримати окремий polling-бот у apps/bot
 * (зручніше для дебагу), у проді — тільки webhook.
 */
import { Bot, InlineKeyboard } from 'grammy';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com';

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

// Singleton — створюємо один раз на час життя процесу.
declare global {
  // eslint-disable-next-line no-var
  var __phonestoreBot: Bot | undefined;
}

export const bot: Bot =
  global.__phonestoreBot ??
  (() => {
    const b = new Bot(BOT_TOKEN);

    b.command('start', async (ctx) => {
      const keyboard = new InlineKeyboard().webApp('🚀 Відкрити CRM', APP_URL);
      await ctx.reply(
        `Привіт, ${ctx.from?.first_name ?? 'друже'}! 👋\n\n` +
          'Це PhoneStore CRM — внутрішня система мережі магазинів смартфонів.\n\n' +
          'Натисни кнопку нижче, щоб відкрити додаток.\n' +
          'Якщо ти бачиш «Доступ закрито» — попроси власника додати тебе у систему.',
        { reply_markup: keyboard },
      );
    });

    b.command('help', async (ctx) => {
      await ctx.reply(
        'Команди:\n' +
          '/start — почати\n' +
          '/app — відкрити CRM\n' +
          '/help — ця довідка',
      );
    });

    b.command('app', async (ctx) => {
      const keyboard = new InlineKeyboard().webApp('🚀 Відкрити CRM', APP_URL);
      await ctx.reply('Натисни щоб відкрити:', { reply_markup: keyboard });
    });

    b.on('message', async (ctx) => {
      await ctx.reply(
        'Це службовий бот. Усі дії — у Mini App. Введи /app щоб відкрити.',
      );
    });

    b.catch((err) => {
      console.error('Bot error:', err);
    });

    return b;
  })();

if (process.env.NODE_ENV !== 'production') {
  global.__phonestoreBot = bot;
}
