import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema';
import { requireAuth } from '../middleware';
import { uuid } from '../auth/crypto';
import { logActivity, notify, nowIso } from '../lib/helpers';
import type { AppEnv } from '../types';

const comments = new Hono<AppEnv>();
comments.use('*', requireAuth);

// GET /api/comments?parentType=issue&parentId=xxx
comments.get('/', async (c) => {
  const db = c.get('db');
  const parentType = c.req.query('parentType');
  const parentId = c.req.query('parentId');
  if (!parentType || !parentId) return c.json({ error: 'Missing parent' }, 400);
  const rows = await db
    .select({
      comment: schema.comments,
      userName: schema.users.fullName,
      userRole: schema.users.role,
    })
    .from(schema.comments)
    .leftJoin(schema.users, eq(schema.comments.userId, schema.users.id))
    .where(
      and(
        eq(schema.comments.parentType, parentType),
        eq(schema.comments.parentId, parentId),
      ),
    )
    .orderBy(schema.comments.createdAt);
  return c.json(
    rows.map((r) => ({
      ...r.comment,
      userName: r.userName,
      userRole: r.userRole,
    })),
  );
});

const commentSchema = z.object({
  parentType: z.enum(['vendor', 'issue', 'promise', 'approval', 'honours_list']),
  parentId: z.string().min(1),
  body: z.string().min(1).max(5000),
});

comments.post('/', async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const parsed = commentSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid comment' }, 400);
  const d = parsed.data;
  const id = uuid();
  await db.insert(schema.comments).values({
    id,
    parentType: d.parentType,
    parentId: d.parentId,
    userId: auth.userId,
    body: d.body,
    createdAt: nowIso(),
  });

  // @mentions -> notify by email local-part or full name match
  const mentions = [...d.body.matchAll(/@([a-zA-Z0-9._-]+)/g)].map((m) => m[1]);
  if (mentions.length) {
    const allUsers = await db.query.users.findMany();
    for (const u of allUsers) {
      const handle = u.email.split('@')[0];
      if (
        mentions.some(
          (m) =>
            handle.toLowerCase() === m.toLowerCase() ||
            u.fullName.toLowerCase().replace(/\s+/g, '') === m.toLowerCase(),
        )
      ) {
        await notify(db, {
          userId: u.id,
          type: 'mentioned',
          title: 'You were mentioned',
          body: d.body.slice(0, 140),
          parentType: d.parentType,
          parentId: d.parentId,
        });
      }
    }
  }

  await logActivity(db, {
    userId: auth.userId,
    action: 'commented',
    parentType: d.parentType,
    parentId: d.parentId,
  });
  return c.json({ id }, 201);
});

// Edit within 15 minutes.
comments.patch('/:id', async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  if (typeof body.body !== 'string' || !body.body.trim())
    return c.json({ error: 'Empty' }, 400);
  const existing = await db.query.comments.findFirst({
    where: eq(schema.comments.id, id),
  });
  if (!existing) return c.json({ error: 'Not found' }, 404);
  if (existing.userId !== auth.userId)
    return c.json({ error: 'Not your comment' }, 403);
  const ageMin = (Date.now() - new Date(existing.createdAt).getTime()) / 60000;
  if (ageMin > 15) return c.json({ error: 'Edit window has passed' }, 403);
  await db
    .update(schema.comments)
    .set({ body: body.body, editedAt: nowIso() })
    .where(eq(schema.comments.id, id));
  return c.json({ ok: true });
});

export default comments;
