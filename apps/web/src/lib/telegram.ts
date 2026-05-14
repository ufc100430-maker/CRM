/**
 * Браузерний хелпер для роботи з Telegram WebApp SDK.
 */
'use client';

import { useEffect, useState } from 'react';

// Глобальний об'єкт WebApp (підвантажується через <Script>)
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date?: number;
    hash?: string;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme: 'light' | 'dark';
  ready(): void;
  expand(): void;
  close(): void;
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText(text: string): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
  };
  BackButton: {
    isVisible: boolean;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    show(): void;
    hide(): void;
  };
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (ok: boolean) => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
}

/**
 * Хук для отримання WebApp після гідрації.
 */
export function useTelegramWebApp(): TelegramWebApp | null {
  const [wa, setWa] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const w = getWebApp();
    if (w) {
      setWa(w);
      w.ready();
      w.expand();
      applyTheme(w);
    }
  }, []);

  return wa;
}

function applyTheme(wa: TelegramWebApp) {
  const root = document.documentElement;
  const t = wa.themeParams;
  if (t.bg_color) root.style.setProperty('--tg-bg', t.bg_color);
  if (t.secondary_bg_color) root.style.setProperty('--tg-bg-secondary', t.secondary_bg_color);
  if (t.text_color) root.style.setProperty('--tg-text', t.text_color);
  if (t.hint_color) root.style.setProperty('--tg-hint', t.hint_color);
  if (t.link_color) root.style.setProperty('--tg-link', t.link_color);
  if (t.button_color) root.style.setProperty('--tg-button', t.button_color);
  if (t.button_text_color) root.style.setProperty('--tg-button-text', t.button_text_color);
}

export function haptic(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light',
) {
  const wa = getWebApp();
  if (!wa) return;
  if (type === 'success' || type === 'error' || type === 'warning') {
    wa.HapticFeedback.notificationOccurred(type);
  } else {
    wa.HapticFeedback.impactOccurred(type);
  }
}
