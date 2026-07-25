import { Hono } from 'hono';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema';
import { requireAuth, requireRole } from '../middleware';
import { uuid } from '../auth/crypto';
import { logActivity, nowIso, slugify } from '../lib/helpers';
import type { AppEnv } from '../types';
import { GMC_ROLES } from '@shared/types';

const vendors = new Hono<AppEnv>();
vendors.use('*', requireAuth);

// List with open-issue counts and 30-day score delta (for "sliding" detection).
vendors.get('/', async (c) => {
  const db = c.get('db');
  const rows = await db.query.vendors.findMany({
    orderBy: (v, { asc }) => [asc(v.name)],
  });

  // open issue counts
  const counts = await db
    .select({
      vendorId: schema.issues.vendorId,
      n: sql<number>`count(*)`,
    })
    .from(schema.issues)
    .where(sql`${schema.issues.boardStage} != 'resolved'`)
    .groupBy(schema.issues.vendorId);
  const countMap = new Map(counts.map((r) => [r.vendorId, r.n]));

  // score 30 days ago per vendor (closest snapshot at/ before cutoff)
  const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString();
  const history = await db
    .select({
      vendorId: schema.scoreHistory.vendorId,
      recordedAt: schema.scoreHistory.recordedAt,
      healthScore: schema.scoreHistory.healthScore,
    })
    .from(schema.scoreHistory)
    .orderBy(desc(schema.scoreHistory.recordedAt));
  const past = new Map<string, number>();
  for (const h of history) {
    if (h.recordedAt <= cutoff && !past.has(h.vendorId)) {
      past.set(h.vendorId, h.healthScore);
    }
  }

  const out = rows.map((v) => {
    const prior = past.get(v.id);
    const change = prior != null ? v.healthScore - prior : 0;
    const sliding = v.status === 'green' && change <= -15;
    return {
      ...v,
      openIssues: countMap.get(v.id) ?? 0,
      scoreChange: change,
      isSliding: sliding,
    };
  });
  return c.json(out);
});

vendors.get('/:slug', async (c) => {
  const db = c.get('db');
  const v = await db.query.vendors.findFirst({
    where: eq(schema.vendors.slug, c.req.param('slug')),
  });
  if (!v) return c.json({ error: 'Vendor not found' }, 404);

  const scoreHistory = await db.query.scoreHistory.findMany({
    where: eq(schema.scoreHistory.vendorId, v.id),
    orderBy: (s, { asc }) => [asc(s.recordedAt)],
  });
  const issues = await db.query.issues.findMany({
    where: eq(schema.issues.vendorId, v.id),
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  });
  return c.json({ ...v, scoreHistory, issues });
});

const vendorSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().optional().nullable(),
  founderName: z.string().optional().nullable(),
  dealUrl: z.string().url().optional().or(z.literal('')).nullable(),
  appUrl: z.string().url().optional().or(z.literal('')).nullable(),
  loginUrl: z.string().url().optional().or(z.literal('')).nullable(),
  changelogUrl: z.string().url().optional().or(z.literal('')).nullable(),
  supportEmail: z.string().optional().nullable(),
  launchDate: z.string().optional().nullable(),
  tierCount: z.number().int().optional().nullable(),
  priceRange: z.string().optional().nullable(),
  monitoringGroup: z.enum(['A', 'B', 'C']).optional(),
  status: z.enum(['green', 'amber', 'red']).optional(),
  healthScore: z.number().int().min(0).max(100).optional(),
});

vendors.post('/', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const parsed = vendorSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json({ error: 'Invalid vendor', issues: parsed.error.issues }, 400);
  const d = parsed.data;
  const id = uuid();
  let slug = slugify(d.name);
  const existing = await db.query.vendors.findFirst({
    where: eq(schema.vendors.slug, slug),
  });
  if (existing) slug = `${slug}-${id.slice(0, 4)}`;

  await db.insert(schema.vendors).values({
    id,
    name: d.name,
    slug,
    companyName: d.companyName ?? null,
    founderName: d.founderName ?? null,
    dealUrl: d.dealUrl || null,
    appUrl: d.appUrl || null,
    loginUrl: d.loginUrl || null,
    changelogUrl: d.changelogUrl || null,
    supportEmail: d.supportEmail ?? null,
    launchDate: d.launchDate ?? null,
    tierCount: d.tierCount ?? null,
    priceRange: d.priceRange ?? null,
    monitoringGroup: d.monitoringGroup ?? 'B',
    healthScore: d.healthScore ?? 50,
    status: d.status ?? 'amber',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  await logActivity(db, {
    userId: auth.userId,
    action: 'created_vendor',
    parentType: 'vendor',
    parentId: id,
    detail: d.name,
  });
  return c.json({ id, slug }, 201);
});

vendors.patch('/:id', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const id = c.req.param('id');
  const parsed = vendorSchema.partial().safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) return c.json({ error: 'Invalid update' }, 400);
  await db
    .update(schema.vendors)
    .set({ ...parsed.data, updatedAt: nowIso() } as any)
    .where(eq(schema.vendors.id, id));
  await logActivity(db, {
    userId: auth.userId,
    action: 'updated_vendor',
    parentType: 'vendor',
    parentId: id,
  });
  return c.json({ ok: true });
});

// One-button flag for support agents.
vendors.post('/:id/flag', async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const note = typeof body.note === 'string' ? body.note.slice(0, 200) : null;
  await db.insert(schema.vendorFlags).values({
    id: uuid(),
    vendorId: id,
    flaggedBy: auth.userId,
    note,
    createdAt: nowIso(),
  });
  await logActivity(db, {
    userId: auth.userId,
    action: 'flagged_vendor',
    parentType: 'vendor',
    parentId: id,
    detail: note,
  });
  return c.json({ ok: true }, 201);
});

// Buyers tab: complaint themes + unanswered questions
vendors.get('/:id/buyers', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const themes = await db.query.complaintThemes.findMany({
    where: eq(schema.complaintThemes.vendorId, id),
    orderBy: (t, { desc }) => [desc(t.weekStarting)],
  });
  const questions = await db.query.unansweredQuestions.findMany({
    where: eq(schema.unansweredQuestions.vendorId, id),
    orderBy: (q, { desc }) => [desc(q.daysUnanswered)],
  });
  return c.json({ themes, questions });
});

// History tab: activity log for a vendor
vendors.get('/:id/activity', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const rows = await db
    .select({
      log: schema.activityLog,
      userName: schema.users.fullName,
    })
    .from(schema.activityLog)
    .leftJoin(schema.users, eq(schema.activityLog.userId, schema.users.id))
    .where(
      and(
        eq(schema.activityLog.parentType, 'vendor'),
        eq(schema.activityLog.parentId, id),
      ),
    )
    .orderBy(desc(schema.activityLog.createdAt))
    .limit(200);
  return c.json(rows.map((r) => ({ ...r.log, userName: r.userName })));
});

export default vendors;
