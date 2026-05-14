import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Telegram-native theme variables (підтягуються з WebApp)
        tg: {
          bg: 'var(--tg-bg, #17212b)',
          bgSecondary: 'var(--tg-bg-secondary, #232e3c)',
          text: 'var(--tg-text, #e8e8e8)',
          hint: 'var(--tg-hint, #8a98a6)',
          link: 'var(--tg-link, #6ab3f5)',
          button: 'var(--tg-button, #6ab3f5)',
          buttonText: 'var(--tg-button-text, #ffffff)',
          border: 'var(--tg-border, #2c3a4d)',
        },
        success: '#4ad184',
        danger: '#f15a5a',
        warning: '#f5c53b',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
