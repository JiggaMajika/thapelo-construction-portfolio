import { Hono } from 'hono';
import { desc, eq, like, or, sql } from 'drizzle-orm';
import * as schema from '../db/schema';
import { requireAuth } from '../middleware';
import type { AppEnv } from '../types';

const support = new Hono<AppEnv>();
support.use('*', requireAuth);

// Fast vendor card for the support desk.
support.get('/vendor/:slug', async (c) => {
  const db = c.get('db');
  const v = await db.query.vendors.findFirst({
    where: eq(schema.vendors.slug, c.req.param('slug')),
  });
  if (!v) return c.json({ error: 'Not found' }, 404);

  const promises = await db.query.promises.findMany({
    where: eq(schema.promises.vendorId, v.id),
    orderBy: (p, { desc }) => [desc(p.promisedOn)],
  });

  // complaints this month grouped by theme
  const monthAgo = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  const themes = await db.query.complaintThemes.findMany({
    where: eq(schema.complaintThemes.vendorId, v.id),
    orderBy: (t, { desc }) => [desc(t.weekStarting)],
  });
  const recentThemes = themes.filter((t) => t.weekStarting >= monthAgo);

  // is under notice / payments held?
  const notices = await db.query.approvals.findMany({
    where: eq(schema.approvals.vendorId, v.id),
  });
  const underNotice = notices.some(
    (a) => a.type === 'formal_notice' && a.status === 'approved',
  );

  return c.json({
    vendor: v,
    promises,
    complaintThemes: recentThemes,
    underNotice,
    payoutHeldPct: v.payoutHeldPct,
  });
});

// This week's heads-up: vendors likely to generate tickets.
support.get('/headsup', async (c) => {
  const db = c.get('db');
  // Amber/red vendors + those with recent status change + sliding.
  const vendors = await db.query.vendors.findMany({
    where: sql`${schema.vendors.status} != 'green' AND ${schema.vendors.isArchived} = 0`,
    orderBy: (v, { asc }) => [asc(v.healthScore)],
    limit: 8,
  });
  return c.json(
    vendors.map((v) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      status: v.status,
      previousStatus: v.previousStatus,
      healthScore: v.healthScore,
    })),
  );
});

// Quick search for the lookup box.
support.get('/search', async (c) => {
  const db = c.get('db');
  const q = (c.req.query('q') || '').trim();
  if (!q) return c.json([]);
  const rows = await db.query.vendors.findMany({
    where: or(
      like(schema.vendors.name, `%${q}%`),
      like(schema.vendors.companyName, `%${q}%`),
    ),
    limit: 10,
  });
  return c.json(
    rows.map((v) => ({ id: v.id, name: v.name, slug: v.slug, status: v.status })),
  );
});

export default support;
