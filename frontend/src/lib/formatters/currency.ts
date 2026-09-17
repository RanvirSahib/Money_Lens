export function formatINR(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatINRCompact(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCurrency(
  amount: number | null | undefined,
  options: { showDecimals?: boolean; compact?: boolean } = {}
): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  if (options.compact) return formatINRCompact(amount);
  return formatINR(amount);
}

export function formatPercentage(value: number, withSign = true): string {
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatShortDate(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatMonthYear(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDate(dateString: string | Date, formatType: 'short' | 'medium' | 'relative' = 'medium'): string {
  if (formatType === 'short') return formatShortDate(dateString);
  return formatShortDate(dateString);
}

export function formatDaysRemaining(days: number): string {
  if (days === 0) return 'Due today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `in ${days} days`;
}
