import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema';
import { requireAuth, requireRole } from '../middleware';
import { uuid } from '../auth/crypto';
import { logActivity, nowIso } from '../lib/helpers';
import type { AppEnv } from '../types';
import { GMC_ROLES } from '@shared/types';

const reports = new Hono<AppEnv>();
reports.use('*', requireAuth);

reports.get('/', async (c) => {
  const db = c.get('db');
  const rows = await db.query.reports.findMany({
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  });
  return c.json(rows);
});

reports.get('/:id', async (c) => {
  const db = c.get('db');
  const r = await db.query.reports.findFirst({
    where: eq(schema.reports.id, c.req.param('id')),
  });
  if (!r) return c.json({ error: 'Not found' }, 404);
  return c.json(r);
});

const reportSchema = z.object({
  type: z.enum(['monday', 'monthly', 'quarterly', 'evidence_pack']),
  title: z.string().min(1),
  periodStart: z.string().optional().nullable(),
  periodEnd: z.string().optional().nullable(),
  bodyMarkdown: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
});

reports.post('/', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const parsed = reportSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid report' }, 400);
  const d = parsed.data;
  const id = uuid();
  await db.insert(schema.reports).values({
    id,
    type: d.type,
    title: d.title,
    periodStart: d.periodStart ?? null,
    periodEnd: d.periodEnd ?? null,
    bodyMarkdown: d.bodyMarkdown ?? '',
    vendorId: d.vendorId ?? null,
    createdBy: auth.userId,
    createdAt: nowIso(),
  });
  await logActivity(db, {
    userId: auth.userId,
    action: 'created_report',
    parentType: 'report',
    parentId: id,
    detail: d.title,
  });
  return c.json({ id }, 201);
});

reports.patch('/:id', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const parsed = reportSchema.partial().safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) return c.json({ error: 'Invalid' }, 400);
  await db
    .update(schema.reports)
    .set(parsed.data as any)
    .where(eq(schema.reports.id, id));
  return c.json({ ok: true });
});

reports.post('/:id/publish', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  await db
    .update(schema.reports)
    .set({ publishedAt: nowIso() })
    .where(eq(schema.reports.id, c.req.param('id')));
  return c.json({ ok: true });
});

export default reports;
