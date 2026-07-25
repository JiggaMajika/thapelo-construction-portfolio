import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { uuid } from '../auth/crypto';

type DB = DrizzleD1Database<typeof schema>;

// Simple fixed-window per-key rate limit backed by D1.
// Returns true if the request is allowed.
export async function checkRateLimit(
  db: DB,
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSeconds * 1000)) * windowSeconds;
  const rowId = `${key}:${windowStart}`;

  const existing = await db.query.loginAttempts.findFirst({
    where: eq(schema.loginAttempts.id, rowId),
  });

  if (!existing) {
    await db
      .insert(schema.loginAttempts)
      .values({
        id: rowId,
        ip: key,
        windowStart: String(windowStart),
        count: 1,
      })
      .onConflictDoNothing();
    return true;
  }

  if (existing.count >= max) return false;

  await db
    .update(schema.loginAttempts)
    .set({ count: existing.count + 1 })
    .where(eq(schema.loginAttempts.id, rowId));
  return true;
}
