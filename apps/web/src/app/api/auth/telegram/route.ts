import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateWithInitData, setSessionCookie } from '@/lib/auth';

const Body = z.object({ initData: z.string().min(10) });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const result = await authenticateWithInitData(parsed.data.initData);
  if (!result) {
    return NextResponse.json(
      { error: 'Доступ закрито. Звернись до власника, щоб тебе додали в систему.' },
      { status: 401 },
    );
  }

  await setSessionCookie(result.token);
  return NextResponse.json({ user: result.user });
}
