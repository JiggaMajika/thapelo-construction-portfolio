import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware';
import { exportAll } from '../lib/backup';
import type { AppEnv } from '../types';

const admin = new Hono<AppEnv>();
admin.use('*', requireAuth);

// Admin-only "Export everything" — downloads the full dataset as JSON.
admin.get('/export', requireRole('gmc_admin'), async (c) => {
  const data = await exportAll(c.env);
  c.header('Content-Type', 'application/json');
  c.header(
    'Content-Disposition',
    `attachment; filename="bridge-export-${new Date().toISOString().slice(0, 10)}.json"`,
  );
  return c.body(JSON.stringify(data, null, 2));
});

export default admin;
