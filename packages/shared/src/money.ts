/**
 * Утиліти для грошей (₴).
 * Всі суми всередині — Number з 2 знаками після коми.
 * Зберігаємо в Decimal у БД для точності.
 */

export function formatUAH(amount: number | string | { toNumber: () => number }): string {
  const n =
    typeof amount === 'number'
      ? amount
      : typeof amount === 'string'
        ? Number(amount)
        : amount.toNumber();
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('uk-UA').format(n);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
