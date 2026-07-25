import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';
import { COOKIE_NAME, verifyToken } from './auth/jwt';
import type { AppEnv } from './types';
import type { Role } from '@shared/types';

// Attach a Drizzle instance to every request.
export const withDb = createMiddleware<AppEnv>(async (c, next) => {
  c.set('db', drizzle(c.env.DB, { schema }));
  await next();
});

// Require a valid JWT; populate c.get('auth').
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) return c.json({ error: 'Not authenticated' }, 401);
  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Invalid or expired session' }, 401);
  c.set('auth', {
    userId: payload.sub,
    role: payload.role,
    organisationId: payload.org,
  });
  await next();
});

// Server-side role gate. Never rely on the UI alone.
export function requireRole(...roles: Role[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const auth = c.get('auth');
    if (!auth || !roles.includes(auth.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    await next();
  });
}
