import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import type { SlaState, VendorStatus } from '@shared/types';

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '—';
  }
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'd MMM yyyy');
  } catch {
    return '—';
  }
}

export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return differenceInDays(new Date(), new Date(iso));
}

// Time remaining until a due date, phrased for an SLA clock.
export function timeRemaining(dueIso: string | null | undefined): string {
  if (!dueIso) return 'No due date';
  const due = new Date(dueIso).getTime();
  const now = Date.now();
  const diff = due - now;
  const abs = Math.abs(diff);
  const hours = Math.round(abs / 3600_000);
  const days = Math.round(abs / 86400_000);
  const label = abs < 48 * 3600_000 ? `${hours}h` : `${days}d`;
  return diff >= 0 ? `${label} left` : `${label} overdue`;
}

export const SLA_TEXT: Record<SlaState, string> = {
  on_track: 'text-muted',
  due_soon: 'text-status-amber font-medium',
  overdue: 'text-status-red font-semibold',
};

export const STATUS_HEX: Record<VendorStatus, string> = {
  green: '#2E9E5B',
  amber: '#E8A317',
  red: '#C93A3A',
};

export const STATUS_WORD: Record<VendorStatus, string> = {
  green: 'Green',
  amber: 'Amber',
  red: 'Red',
};
