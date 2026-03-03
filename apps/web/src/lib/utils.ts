import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Locale as DateLocale, format, formatDistanceToNow, parseISO } from "date-fns";
import { enUS, de, ru } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatNumber(
  value: number,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactNumber(
  value: number,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

const dateLocales: Record<string, DateLocale> = {
  en: enUS,
  de: de,
  ru: ru,
};

export function formatDate(
  date: string | Date,
  formatStr: string = "PPp",
  locale: string = "en"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, {
    locale: dateLocales[locale] || enUS,
  });
}

export function formatRelativeTime(
  date: string | Date,
  locale: string = "en"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: dateLocales[locale] || enUS,
  });
}

export function getChangeColor(value: number): string {
  if (value > 0) return "text-positive";
  if (value < 0) return "text-negative";
  return "text-text-secondary";
}

export function getChangeBgColor(value: number): string {
  if (value > 0) return "bg-positive/10 text-positive";
  if (value < 0) return "bg-negative/10 text-negative";
  return "bg-surface-light text-text-secondary";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
