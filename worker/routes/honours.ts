import { Hono } from 'hono';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema';
import { requireAuth, requireRole } from '../middleware';
import { uuid } from '../auth/crypto';
import {
  addCalendarDays,
  computeSlaState,
  logActivity,
  nowIso,
} from '../lib/helpers';
import type { AppEnv } from '../types';
import { GMC_ROLES } from '@shared/types';

const honours = new Hono<AppEnv>();
honours.use('*', requireAuth);

honours.get('/', async (c) => {
  const db = c.get('db');
  const lists = await db.query.honoursLists.findMany({
    orderBy: (h, { desc }) => [desc(h.month)],
  });
  return c.json(lists);
});

honours.get('/eligible', async (c) => {
  const db = c.get('db');
  // Eligible: green now, no open (non-resolved) issues.
  const green = await db.query.vendors.findMany({
    where: and(
      eq(schema.vendors.status, 'green'),
      eq(schema.vendors.isArchived, false),
    ),
    orderBy: (v, { desc }) => [desc(v.healthScore)],
  });
  const openIssues = await db
    .select({ vendorId: schema.issues.vendorId })
    .from(schema.issues)
    .where(sql`${schema.issues.boardStage} != 'resolved'`);
  const blocked = new Set(openIssues.map((r) => r.vendorId));
  return c.json(green.filter((v) => !blocked.has(v.id)));
});

honours.get('/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const list = await db.query.honoursLists.findFirst({
    where: eq(schema.honoursLists.id, id),
  });
  if (!list) return c.json({ error: 'Not found' }, 404);
  const entries = await db
    .select({
      entry: schema.honoursEntries,
      vendorName: schema.vendors.name,
      vendorSlug: schema.vendors.slug,
      badge: schema.vendors.badgeLevel,
    })
    .from(schema.honoursEntries)
    .leftJoin(schema.vendors, eq(schema.honoursEntries.vendorId, schema.vendors.id))
    .where(eq(schema.honoursEntries.honoursListId, id))
    .orderBy(schema.honoursEntries.position);
  return c.json({
    ...list,
    slaState: computeSlaState(list.submittedAt, list.dueAt),
    entries: entries.map((e) => ({
      ...e.entry,
      vendorName: e.vendorName,
      vendorSlug: e.vendorSlug,
      badge: e.badge,
    })),
  });
});

honours.post('/', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => ({}));
  const id = uuid();
  const month = body.month || new Date().toISOString().slice(0, 8) + '01';
  await db.insert(schema.honoursLists).values({
    id,
    month,
    title: body.title || `Honours — ${month.slice(0, 7)}`,
    status: 'draft',
    createdAt: nowIso(),
  });
  await logActivity(db, {
    userId: auth.userId,
    action: 'created_honours',
    parentType: 'honours_list',
    parentId: id,
  });
  return c.json({ id }, 201);
});

const entriesSchema = z.object({
  entries: z.array(
    z.object({
      vendorId: z.string(),
      position: z.number().int().min(1).max(10),
      citation: z.string().optional().nullable(),
    }),
  ),
});

// Replace the full ordered set of entries for a draft list.
honours.put('/:id/entries', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const parsed = entriesSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid entries' }, 400);
  await db
    .delete(schema.honoursEntries)
    .where(eq(schema.honoursEntries.honoursListId, id));
  for (const e of parsed.data.entries) {
    await db.insert(schema.honoursEntries).values({
      id: uuid(),
      honoursListId: id,
      vendorId: e.vendorId,
      position: e.position,
      citation: e.citation ?? null,
      createdAt: nowIso(),
    });
  }
  return c.json({ ok: true });
});

honours.post('/:id/submit', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const id = c.req.param('id');
  const dueAt = addCalendarDays(new Date(), 5).toISOString();
  await db
    .update(schema.honoursLists)
    .set({ status: 'submitted', submittedAt: nowIso(), dueAt })
    .where(eq(schema.honoursLists.id, id));
  await logActivity(db, {
    userId: auth.userId,
    action: 'submitted_honours',
    parentType: 'honours_list',
    parentId: id,
  });
  return c.json({ ok: true });
});

// Only appsumo_exec can approve.
honours.post('/:id/approve', requireRole('appsumo_exec'), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const id = c.req.param('id');
  await db
    .update(schema.honoursLists)
    .set({ status: 'approved', approvedBy: auth.userId, approvedAt: nowIso() })
    .where(eq(schema.honoursLists.id, id));
  await logActivity(db, {
    userId: auth.userId,
    action: 'approved_honours',
    parentType: 'honours_list',
    parentId: id,
  });
  return c.json({ ok: true });
});

honours.post('/:id/publish', requireRole('appsumo_exec'), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  await db
    .update(schema.honoursLists)
    .set({ status: 'published', publishedAt: nowIso() })
    .where(eq(schema.honoursLists.id, id));
  return c.json({ ok: true });
});

// Swap out an entry (marks swapped, exec action).
honours.post('/:id/entries/:entryId/swap', requireRole('appsumo_exec'), async (c) => {
  const db = c.get('db');
  await db
    .update(schema.honoursEntries)
    .set({ isSwappedOut: true })
    .where(eq(schema.honoursEntries.id, c.req.param('entryId')));
  return c.json({ ok: true });
});

export default honours;
