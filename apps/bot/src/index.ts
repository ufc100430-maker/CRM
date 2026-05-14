/**
 * PhoneStore CRM — Telegram Bot.
 * Простий бот, який:
 *  - вітає нових користувачів
 *  - відкриває Mini App
 *  - буде слати сповіщення з backend через POST /sendMessage
 */
import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com';

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('🚀 Відкрити CRM', APP_URL);
  await ctx.reply(
    `Привіт, ${ctx.from?.first_name ?? 'друже'}! 👋\n\n` +
      'Це PhoneStore CRM — внутрішня система мережі магазинів смартфонів.\n\n' +
      'Натисни кнопку нижче, щоб відкрити додаток.\n' +
      'Якщо ти бачиш "Доступ закрито" — попроси власника додати тебе у систему.',
    { reply_markup: keyboard },
  );
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    'Команди:\n' +
      '/start — почати\n' +
      '/app — відкрити CRM\n' +
      '/help — ця довідка',
  );
});

bot.command('app', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('🚀 Відкрити CRM', APP_URL);
  await ctx.reply('Натисни щоб відкрити:', { reply_markup: keyboard });
});

bot.on('message', async (ctx) => {
  await ctx.reply(
    'Це службовий бот. Усі дії — у Mini App. Введи /app щоб відкрити.',
  );
});

bot.catch((err) => {
  console.error('Bot error:', err);
});

console.log('🤖 Bot starting...');
bot.start({
  onStart: (botInfo) => {
    console.log(`✅ Bot started: @${botInfo.username}`);
  },
});
