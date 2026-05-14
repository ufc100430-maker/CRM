/**
 * Серверні хелпери для авторизації:
 *  - перевірка Telegram initData
 *  - підпис/перевірка JWT для подальших запитів
 */
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@phonestore/db';
import { verifyTelegramInitData } from '@phonestore/shared';

const COOKIE_NAME = 'phonestore_session';
const JWT_ALG = 'HS256';

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 chars. Set it in .env.local');
  }
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  userId: string;
  role: string;
  storeId: string | null;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [JWT_ALG] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Прочитати поточну сесію з cookie. Викликати в API routes / server components.
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

/**
 * Авторизувати по initData. Шукає юзера по telegram_id або username.
 * Якщо знайшов — створює сесію.
 * Якщо ні — повертає null (не створюємо юзерів автоматично, тільки власник додає).
 *
 * Спеціальний випадок: якщо initial owner з env ще не має заповненого telegram_id —
 * прив'язуємо при першому вході.
 */
export async function authenticateWithInitData(
  initData: string,
): Promise<{ token: string; user: { id: string; role: string; fullName: string } } | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is missing');
    return null;
  }

  const parsed = verifyTelegramInitData(initData, botToken);
  if (!parsed?.user) return null;

  const tgUser = parsed.user;
  const tgId = BigInt(tgUser.id);

  // 1. Шукаємо по telegram_id
  let user = await prisma.user.findUnique({ where: { telegramId: tgId } });

  // 2. Якщо не знайшли — шукаємо по username (для першого входу або зміни telegram_id)
  if (!user && tgUser.username) {
    user = await prisma.user.findUnique({ where: { telegramUsername: tgUser.username } });
    if (user) {
      // Прив'язуємо реальний telegram_id
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramId: tgId,
          fullName:
            user.fullName === 'Власник'
              ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`
              : user.fullName,
        },
      });
    }
  }

  if (!user || !user.active) return null;

  const token = await createSession({
    userId: user.id,
    role: user.role,
    storeId: user.storeId,
  });

  return {
    token,
    user: { id: user.id, role: user.role, fullName: user.fullName },
  };
}
