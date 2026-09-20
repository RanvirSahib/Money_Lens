export function formatINR(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactINR(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  const abs = Math.abs(value);
  if (abs >= 10000000) {
    return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (abs >= 100000) {
    return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  }
  if (abs >= 1000) {
    return `₹${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return formatINR(value);
}

export function parseIndianCurrency(input: string | number): number {
  if (typeof input === 'number') return input;
  if (!input || typeof input !== 'string') return 0;

  const cleaned = input.trim().toLowerCase().replace(/,/g, '');

  const croreMatch = cleaned.match(/([\d.]+)\s*(?:cr|crore|crores)/);
  if (croreMatch) {
    return Math.round(parseFloat(croreMatch[1]) * 10000000);
  }

  const lakhMatch = cleaned.match(/([\d.]+)\s*(?:l|lakh|lakhs|lac|lacs)/);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  const thousandMatch = cleaned.match(/([\d.]+)\s*(?:k|thousand)/);
  if (thousandMatch) {
    return Math.round(parseFloat(thousandMatch[1]) * 1000);
  }

  const num = parseFloat(cleaned.replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : Math.round(num);
}
