import { NextResponse } from 'next/server';
import { prisma } from '@phonestore/db';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { store: true },
  });

  if (!user || !user.active) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    telegramUsername: user.telegramUsername,
    store: user.store
      ? { id: user.store.id, name: user.store.name, address: user.store.address }
      : null,
  });
}
