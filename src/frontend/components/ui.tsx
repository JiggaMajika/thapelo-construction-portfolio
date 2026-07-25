import type { ReactNode } from 'react';
import { STATUS_HEX, STATUS_WORD } from '../lib/format';
import type { BadgeLevel, PromiseStatus, Severity, VendorStatus } from '@shared/types';

// Status is ALWAYS a coloured dot + a word, never colour alone (accessibility).
export function StatusDot({
  status,
  showWord = true,
  size = 10,
}: {
  status: VendorStatus;
  showWord?: boolean;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block rounded-full"
        style={{ width: size, height: size, backgroundColor: STATUS_HEX[status] }}
        aria-hidden
      />
      {showWord && <span className="text-sm">{STATUS_WORD[status]}</span>}
    </span>
  );
}

export function Badge({ level }: { level: BadgeLevel }) {
  if (level === 'none') return <span className="text-xs text-muted">—</span>;
  const map: Record<Exclude<BadgeLevel, 'none'>, string> = {
    bronze: 'bg-[#CD7F32]/15 text-[#8a5a24]',
    silver: 'bg-[#9AA3AF]/20 text-[#5b636e]',
    gold: 'bg-gold/20 text-[#8a6a04]',
  };
  return (
    <span className={`pill ${map[level as Exclude<BadgeLevel, 'none'>]}`}>
      {level[0].toUpperCase() + level.slice(1)}
    </span>
  );
}

const PROMISE_STATUS_STYLE: Record<PromiseStatus, string> = {
  promised: 'bg-fill text-muted',
  in_progress: 'bg-blue-50 text-blue-700',
  delivered: 'bg-status-green/15 text-status-green',
  overdue: 'bg-status-amber/15 text-[#8a6a04]',
  broken: 'bg-status-red/15 text-status-red',
};
const PROMISE_STATUS_LABEL: Record<PromiseStatus, string> = {
  promised: 'Promised',
  in_progress: 'In progress',
  delivered: 'Delivered',
  overdue: 'Overdue',
  broken: 'Broken',
};

export function PromiseBadge({ status }: { status: PromiseStatus }) {
  return (
    <span className={`pill ${PROMISE_STATUS_STYLE[status]}`}>
      {PROMISE_STATUS_LABEL[status]}
    </span>
  );
}

const SEVERITY_HEX: Record<Severity, string> = {
  minor: '#6B7280',
  notable: '#E8A317',
  serious: '#C93A3A',
};
export function SeverityDot({ severity }: { severity: Severity }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: SEVERITY_HEX[severity] }}
      title={severity}
      aria-label={`Severity: ${severity}`}
    />
  );
}

export function Avatar({ name }: { name: string | null | undefined }) {
  const initials = (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-white"
      title={name || ''}
    >
      {initials}
    </span>
  );
}

export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-fill/50 px-6 py-10 text-center">
      {icon && <div className="mb-2 text-muted">{icon}</div>}
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted">{hint}</p>
    </div>
  );
}

export function StatCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink" />
      <span className="ml-2">Loading…</span>
    </div>
  );
}
