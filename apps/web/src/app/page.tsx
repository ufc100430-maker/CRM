'use client';

import { useEffect, useState } from 'react';
import { useTelegramWebApp, haptic } from '@/lib/telegram';

interface Me {
  id: string;
  fullName: string;
  role: string;
  store: { id: string; name: string; address: string } | null;
}

export default function HomePage() {
  const wa = useTelegramWebApp();
  const [status, setStatus] = useState<'loading' | 'unauth' | 'authed' | 'error'>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wa) return;
    const initData = wa.initData;
    if (!initData) {
      setStatus('error');
      setError('Цей додаток потрібно відкривати з Telegram. Якщо ти бачиш це у браузері — це нормально для розробки.');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? 'Помилка авторизації');
          setStatus('unauth');
          haptic('error');
          return;
        }
        const meRes = await fetch('/api/me');
        if (meRes.ok) {
          const data = (await meRes.json()) as Me;
          setMe(data);
          setStatus('authed');
          haptic('success');
        }
      } catch {
        setStatus('error');
        setError('Не вдалось зв’язатися з сервером');
      }
    })();
  }, [wa]);

  if (status === 'loading') {
    return <Centered>Завантаження…</Centered>;
  }

  if (status === 'error') {
    return (
      <Centered>
        <div className="tg-card max-w-sm text-center">
          <div className="mb-2 text-2xl">⚠️</div>
          <p className="text-tg-text">{error}</p>
          <p className="mt-3 text-sm text-tg-hint">
            Якщо ти власник і тільки що створив бота — пропиши себе у системі через
            <code className="mx-1 rounded bg-tg-bg px-1 py-0.5 text-xs">INITIAL_OWNER_TELEGRAM_USERNAME</code>
            у .env.
          </p>
        </div>
      </Centered>
    );
  }

  if (status === 'unauth') {
    return (
      <Centered>
        <div className="tg-card max-w-sm text-center">
          <div className="mb-2 text-2xl">🔒</div>
          <p className="text-tg-text">{error ?? 'Доступ закрито'}</p>
          <p className="mt-3 text-sm text-tg-hint">
            Зверни увагу: у системі мають бути додані твій Telegram username і роль.
            Це робить власник через адмінку.
          </p>
        </div>
      </Centered>
    );
  }

  return <Dashboard me={me!} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}

function Dashboard({ me }: { me: Me }) {
  const initials = me.fullName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <main className="mx-auto max-w-md px-4 py-4">
      {/* Привітання */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-warning to-orange-500 text-sm font-semibold text-white">
          {initials}
        </div>
        <div>
          <div className="text-lg font-semibold">Привіт, {me.fullName}! 👋</div>
          <div className="text-xs text-tg-hint">
            {me.store ? me.store.name : 'Без прив’язки до магазину'} · {roleLabel(me.role)}
          </div>
        </div>
      </div>

      {/* Картки KPI (заглушки до підключення даних) */}
      <div className="tg-card mb-3">
        <div className="text-xs uppercase tracking-wider text-tg-hint">Моя виручка сьогодні</div>
        <div className="text-3xl font-bold">— ₴</div>
        <div className="text-sm text-tg-hint">Дані з’являться після першого продажу</div>
      </div>

      {/* Швидкі дії */}
      <div className="grid grid-cols-3 gap-2.5">
        <QuickAction icon="💰" label="Новий продаж" />
        <QuickAction icon="📦" label="Склад" />
        <QuickAction icon="📸" label="Чек-лист" />
        <QuickAction icon="✅" label="Задачі" />
        <QuickAction icon="🏆" label="KPI" />
        <QuickAction icon="↩️" label="Повернення" />
      </div>

      {/* Підказка для першого входу */}
      <div className="mt-6 rounded-xl border border-tg-border bg-tg-bgSecondary/50 p-4 text-sm text-tg-hint">
        ✨ <b className="text-tg-text">MVP в розробці.</b> Поки тут видно лише авторизацію. Модулі
        продажів, складу і дашборду додаються інкрементально.
      </div>
    </main>
  );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      onClick={() => haptic('light')}
      className="flex flex-col items-center justify-center rounded-2xl bg-tg-bgSecondary p-4 text-center active:opacity-70"
    >
      <span className="mb-1.5 text-2xl">{icon}</span>
      <span className="text-xs leading-tight">{label}</span>
    </button>
  );
}

function roleLabel(role: string): string {
  switch (role) {
    case 'SELLER':
      return 'Продавець';
    case 'DIRECTOR':
      return 'Директор';
    case 'OWNER':
      return 'Власник';
    case 'ADMIN':
      return 'Адмін';
    case 'REGIONAL_MANAGER':
      return 'Регіональний менеджер';
    case 'ACCOUNTANT':
      return 'Бухгалтер';
    case 'SERVICE_ENGINEER':
      return 'Сервіс-інженер';
    default:
      return role;
  }
}
