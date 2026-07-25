import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema';
import { verifyPassword } from '../auth/crypto';
import {
  buildAuthCookie,
  clearAuthCookie,
  signToken,
} from '../auth/jwt';
import { requireAuth } from '../middleware';
import { nowIso, logActivity } from '../lib/helpers';
import { checkRateLimit } from '../lib/ratelimit';
import type { AppEnv } from '../types';
import type { AuthUser } from '@shared/types';

const auth = new Hono<AppEnv>();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

auth.post('/login', async (c) => {
  const db = c.get('db');
  const ip = c.req.header('cf-connecting-ip') || 'unknown';

  // Per-IP rate limit on the login route.
  const allowed = await checkRateLimit(db, `login:${ip}`, 20, 60);
  if (!allowed) {
    return c.json({ error: 'Too many attempts. Please wait a minute.' }, 429);
  }

  const parsed = loginSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400);
  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email.toLowerCase()),
  });
  // Generic message either way to avoid user enumeration.
  const invalid = () => c.json({ error: 'Invalid email or password' }, 401);
  if (!user) {
    await verifyPassword(password, '00', 'x'); // constant-ish work
    return invalid();
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return c.json(
      { error: 'Account locked. Try again in a few minutes.' },
      423,
    );
  }

  const ok = await verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!ok) {
    const failed = user.failedLoginCount + 1;
    const lockedUntil =
      failed >= MAX_FAILED
        ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
        : null;
    await db
      .update(schema.users)
      .set({ failedLoginCount: failed, lockedUntil })
      .where(eq(schema.users.id, user.id));
    return invalid();
  }

  // Success: reset counters, stamp last seen, issue token.
  await db
    .update(schema.users)
    .set({ failedLoginCount: 0, lockedUntil: null, lastSeenAt: nowIso() })
    .where(eq(schema.users.id, user.id));

  const token = await signToken(
    { sub: user.id, role: user.role as AuthUser['role'], org: user.organisationId },
    c.env.JWT_SECRET,
  );
  c.header('Set-Cookie', buildAuthCookie(token));
  await logActivity(db, { userId: user.id, action: 'logged_in' });
  return c.json({ ok: true });
});

auth.post('/logout', (c) => {
  c.header('Set-Cookie', clearAuthCookie());
  return c.json({ ok: true });
});

auth.get('/me', requireAuth, async (c) => {
  const db = c.get('db');
  const { userId } = c.get('auth');
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });
  if (!user) return c.json({ error: 'Not found' }, 404);
  const org = await db.query.organisations.findFirst({
    where: eq(schema.organisations.id, user.organisationId),
  });
  const dto: AuthUser = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as AuthUser['role'],
    organisationId: user.organisationId,
    organisationName: org?.name ?? '',
    organisationType: (org?.type as AuthUser['organisationType']) ?? 'gmc',
    avatarUrl: user.avatarUrl,
  };
  return c.json(dto);
});

export default auth;
