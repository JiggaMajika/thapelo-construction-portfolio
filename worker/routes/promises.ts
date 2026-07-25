import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema';
import { requireAuth, requireRole } from '../middleware';
import { uuid } from '../auth/crypto';
import { logActivity, nowIso } from '../lib/helpers';
import type { AppEnv } from '../types';
import { GMC_ROLES } from '@shared/types';

const promises = new Hono<AppEnv>();
promises.use('*', requireAuth);

promises.get('/', async (c) => {
  const db = c.get('db');
  const vendorId = c.req.query('vendorId');
  const rows = vendorId
    ? await db.query.promises.findMany({
        where: eq(schema.promises.vendorId, vendorId),
        orderBy: (p, { desc }) => [desc(p.promisedOn)],
      })
    : await db.query.promises.findMany({
        orderBy: (p, { desc }) => [desc(p.createdAt)],
        limit: 200,
      });
  return c.json(rows);
});

const promiseSchema = z.object({
  vendorId: z.string().min(1),
  promiseText: z.string().min(1),
  sourceType: z.enum([
    'deal_page',
    'terms',
    'qa_comment',
    'founder_email',
    'roadmap',
  ]),
  sourceUrl: z.string().optional().nullable(),
  screenshotUrl: z.string().optional().nullable(),
  promisedOn: z.string().optional().nullable(),
  dueBy: z.string().optional().nullable(),
  status: z
    .enum(['promised', 'in_progress', 'delivered', 'overdue', 'broken'])
    .optional(),
  evidenceNote: z.string().optional().nullable(),
});

promises.post('/', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const parsed = promiseSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json({ error: 'Invalid promise', issues: parsed.error.issues }, 400);
  const d = parsed.data;
  const id = uuid();
  await db.insert(schema.promises).values({
    id,
    vendorId: d.vendorId,
    promiseText: d.promiseText,
    sourceType: d.sourceType,
    sourceUrl: d.sourceUrl ?? null,
    screenshotUrl: d.screenshotUrl ?? null,
    promisedOn: d.promisedOn ?? null,
    dueBy: d.dueBy ?? null,
    status: d.status ?? 'promised',
    evidenceNote: d.evidenceNote ?? null,
    createdBy: auth.userId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  await logActivity(db, {
    userId: auth.userId,
    action: 'added_promise',
    parentType: 'vendor',
    parentId: d.vendorId,
    detail: d.promiseText.slice(0, 120),
  });
  return c.json({ id }, 201);
});

promises.patch('/:id', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const id = c.req.param('id');
  const parsed = promiseSchema.partial().safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) return c.json({ error: 'Invalid update' }, 400);
  await db
    .update(schema.promises)
    .set({ ...parsed.data, updatedAt: nowIso() } as any)
    .where(eq(schema.promises.id, id));
  await logActivity(db, {
    userId: auth.userId,
    action: 'updated_promise',
    parentType: 'promise',
    parentId: id,
  });
  return c.json({ ok: true });
});

export default promises;
