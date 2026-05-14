/**
 * Telegram webhook endpoint.
 * Telegram POST-ить сюди кожен update (повідомлення, callback, etc).
 * grammY обробляє і відповідає через Bot API.
 */
import { webhookCallback } from 'grammy';
import { bot } from '@/lib/bot';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = webhookCallback(bot, 'std/http');
