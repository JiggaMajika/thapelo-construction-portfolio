import { Hono } from 'hono';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema';
import { requireAuth, requireRole } from '../middleware';
import { hashPassword, uuid } from '../auth/crypto';
import { logActivity, nowIso } from '../lib/helpers';
import type { AppEnv } from '../types';
import { ROLES } from '@shared/types';

// --- Global search ---
export const search = new Hono<AppEnv>();
search.use('*', requireAuth);
search.get('/', async (c) => {
  const db = c.get('db');
  const q = (c.req.query('q') || '').trim();
  if (q.length < 2) return c.json({ vendors: [], issues: [], promises: [] });
  const pat = `%${q}%`;
  const vendors = await db.query.vendors.findMany({
    where: or(
      like(schema.vendors.name, pat),
      like(schema.vendors.companyName, pat),
    ),
    limit: 8,
  });
  const issues = await db
    .select({
      issue: schema.issues,
      vendorSlug: schema.vendors.slug,
    })
    .from(schema.issues)
    .leftJoin(schema.vendors, eq(schema.issues.vendorId, schema.vendors.id))
    .where(like(schema.issues.title, pat))
    .limit(8);
  const promises = await db
    .select({
      promise: schema.promises,
      vendorSlug: schema.vendors.slug,
    })
    .from(schema.promises)
    .leftJoin(schema.vendors, eq(schema.promises.vendorId, schema.vendors.id))
    .where(like(schema.promises.promiseText, pat))
    .limit(8);
  return c.json({
    vendors: vendors.map((v) => ({ id: v.id, name: v.name, slug: v.slug, status: v.status })),
    issues: issues.map((r) => ({
      id: r.issue.id,
      title: r.issue.title,
      vendorSlug: r.vendorSlug,
    })),
    promises: promises.map((r) => ({
      id: r.promise.id,
      text: r.promise.promiseText,
      vendorSlug: r.vendorSlug,
    })),
  });
});

// --- Global activity log (admin) ---
export const activity = new Hono<AppEnv>();
activity.use('*', requireAuth);
activity.get('/', requireRole('gmc_admin'), async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({ log: schema.activityLog, userName: schema.users.fullName })
    .from(schema.activityLog)
    .leftJoin(schema.users, eq(schema.activityLog.userId, schema.users.id))
    .orderBy(desc(schema.activityLog.createdAt))
    .limit(300);
  return c.json(rows.map((r) => ({ ...r.log, userName: r.userName })));
});

// --- Users / profile / user management ---
export const users = new Hono<AppEnv>();
users.use('*', requireAuth);

users.get('/', requireRole('gmc_admin'), async (c) => {
  const db = c.get('db');
  const rows = await db.query.users.findMany({
    orderBy: (u, { asc }) => [asc(u.fullName)],
  });
  return c.json(
    rows.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      organisationId: u.organisationId,
      lastSeenAt: u.lastSeenAt,
    })),
  );
});

const newUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(ROLES as [string, ...string[]]),
  organisationId: z.string().min(1),
  tempPassword: z.string().min(12),
});

users.post('/', requireRole('gmc_admin'), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const parsed = newUserSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json({ error: 'Invalid user (password min 12 chars)' }, 400);
  const d = parsed.data;
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, d.email.toLowerCase()),
  });
  if (existing) return c.json({ error: 'Email already exists' }, 409);
  const { hash, salt } = await hashPassword(d.tempPassword);
  const id = uuid();
  await db.insert(schema.users).values({
    id,
    email: d.email.toLowerCase(),
    fullName: d.fullName,
    role: d.role,
    organisationId: d.organisationId,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: nowIso(),
  });
  await logActivity(db, {
    userId: auth.userId,
    action: 'created_user',
    detail: d.email,
  });
  return c.json({ id }, 201);
});

// Admin resets a password manually (hands over temp password out of band).
users.post('/:id/reset-password', requireRole('gmc_admin'), async (c) => {
  const db = c.get('db');
  const body = await c.req.json().catch(() => ({}));
  if (typeof body.tempPassword !== 'string' || body.tempPassword.length < 12)
    return c.json({ error: 'Password must be at least 12 characters' }, 400);
  const { hash, salt } = await hashPassword(body.tempPassword);
  await db
    .update(schema.users)
    .set({
      passwordHash: hash,
      passwordSalt: salt,
      failedLoginCount: 0,
      lockedUntil: null,
    })
    .where(eq(schema.users.id, c.req.param('id')));
  return c.json({ ok: true });
});

export const orgs = new Hono<AppEnv>();
orgs.use('*', requireAuth);
orgs.get('/', async (c) => {
  const db = c.get('db');
  return c.json(await db.query.organisations.findMany());
});
