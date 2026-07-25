import { Hono } from 'hono';
import { and, desc, eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { requireAuth } from '../middleware';
import type { AppEnv } from '../types';

const notifications = new Hono<AppEnv>();
notifications.use('*', requireAuth);

notifications.get('/', async (c) => {
  const db = c.get('db');
  const { userId } = c.get('auth');
  const rows = await db.query.notifications.findMany({
    where: eq(schema.notifications.userId, userId),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: 50,
  });
  const unread = rows.filter((r) => !r.isRead).length;
  return c.json({ items: rows, unread });
});

notifications.post('/read', async (c) => {
  const db = c.get('db');
  const { userId } = c.get('auth');
  await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(eq(schema.notifications.userId, userId));
  return c.json({ ok: true });
});

notifications.post('/:id/read', async (c) => {
  const db = c.get('db');
  const { userId } = c.get('auth');
  await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(schema.notifications.id, c.req.param('id')),
        eq(schema.notifications.userId, userId),
      ),
    );
  return c.json({ ok: true });
});

export default notifications;
