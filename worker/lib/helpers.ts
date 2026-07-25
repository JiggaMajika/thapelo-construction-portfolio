import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { uuid } from '../auth/crypto';
import type { SlaState } from '@shared/types';

type DB = DrizzleD1Database<typeof schema>;

export function nowIso(): string {
  return new Date().toISOString();
}

export async function logActivity(
  db: DB,
  args: {
    userId?: string | null;
    action: string;
    parentType?: string | null;
    parentId?: string | null;
    detail?: string | null;
  },
): Promise<void> {
  await db.insert(schema.activityLog).values({
    id: uuid(),
    userId: args.userId ?? null,
    action: args.action,
    parentType: args.parentType ?? null,
    parentId: args.parentId ?? null,
    detail: args.detail ?? null,
    createdAt: nowIso(),
  });
}

export async function notify(
  db: DB,
  args: {
    userId: string;
    type: string;
    title: string;
    body?: string | null;
    parentType?: string | null;
    parentId?: string | null;
  },
): Promise<void> {
  await db.insert(schema.notifications).values({
    id: uuid(),
    userId: args.userId,
    type: args.type,
    title: args.title,
    body: args.body ?? null,
    parentType: args.parentType ?? null,
    parentId: args.parentId ?? null,
    isRead: false,
    createdAt: nowIso(),
  });
}

// Compute SLA state from a start time and due time.
// due_soon when under 25% of the window remains; overdue when past due.
export function computeSlaState(
  startIso: string | null | undefined,
  dueIso: string | null | undefined,
  ref: Date = new Date(),
): SlaState {
  if (!dueIso) return 'on_track';
  const due = new Date(dueIso).getTime();
  const now = ref.getTime();
  if (now >= due) return 'overdue';
  const start = startIso ? new Date(startIso).getTime() : now;
  const total = due - start;
  if (total <= 0) return 'on_track';
  const remaining = due - now;
  if (remaining / total <= 0.25) return 'due_soon';
  return 'on_track';
}

// Add N working days (skip Sat/Sun) to a date.
export function addWorkingDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

export function addHours(from: Date, hours: number): Date {
  return new Date(from.getTime() + hours * 3600_000);
}

export function addCalendarDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Default due date for an issue at creation, per the SLA table.
export function defaultIssueDue(severity: string, detectedAt: Date): string {
  if (severity === 'serious') return addHours(detectedAt, 24).toISOString();
  return addWorkingDays(detectedAt, 3).toISOString();
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
