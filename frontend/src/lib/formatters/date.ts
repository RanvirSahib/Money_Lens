export function formatDate(dateString: string | Date, formatType: 'short' | 'medium' | 'relative' = 'medium'): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return String(dateString);

  if (formatType === 'short') {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  if (formatType === 'medium') {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  return date.toLocaleDateString('en-IN');
}

export function formatDaysRemaining(days: number): string {
  if (days === 0) return 'Due today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `in ${days} days`;
}
