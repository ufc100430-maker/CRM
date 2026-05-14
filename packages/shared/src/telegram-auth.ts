/**
 * Перевірка підпису Telegram WebApp initData.
 *
 * Документація: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Ключовий момент: за допомогою HMAC-SHA256 з секретного ключа,
 * виведеного з токена бота, ми переконуємось що initData дійсно
 * від Telegram і не підроблений.
 */
import { createHmac } from 'node:crypto';

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  start_param?: string;
}

/**
 * Розпарсити initData рядок у структурований об'єкт.
 */
export function parseInitData(initDataString: string): {
  data: Record<string, string>;
  hash: string;
} {
  const params = new URLSearchParams(initDataString);
  const hash = params.get('hash') ?? '';
  params.delete('hash');
  const data: Record<string, string> = {};
  params.forEach((value, key) => {
    data[key] = value;
  });
  return { data, hash };
}

/**
 * Перевірити підпис initData.
 * Повертає розпарсений об'єкт або null якщо підпис недійсний.
 *
 * @param initDataString — `window.Telegram.WebApp.initData`
 * @param botToken — токен бота з BotFather
 * @param maxAgeSec — максимальний вік initData (за замовчуванням 1 година)
 */
export function verifyTelegramInitData(
  initDataString: string,
  botToken: string,
  maxAgeSec = 60 * 60,
): TelegramInitData | null {
  if (!initDataString || !botToken) return null;

  const { data, hash } = parseInitData(initDataString);
  if (!hash) return null;

  // Сортуємо ключі і складаємо data_check_string
  const dataCheckString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');

  // Виводимо секрет: HMAC-SHA256("WebAppData", bot_token)
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();

  // Обчислюємо очікуваний хеш
  const expectedHash = createHmac('sha256', secret).update(dataCheckString).digest('hex');

  if (expectedHash !== hash) return null;

  // Перевіряємо вік
  const authDate = Number(data.auth_date ?? 0);
  if (!authDate) return null;
  const ageSec = Math.floor(Date.now() / 1000) - authDate;
  if (ageSec > maxAgeSec) return null;

  // Парсимо user
  let user: TelegramUser | undefined;
  if (data.user) {
    try {
      user = JSON.parse(data.user) as TelegramUser;
    } catch {
      return null;
    }
  }

  return {
    user,
    auth_date: authDate,
    hash,
    query_id: data.query_id,
    start_param: data.start_param,
  };
}
