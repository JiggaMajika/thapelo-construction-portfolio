import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware';
import { uuid } from '../auth/crypto';
import type { AppEnv } from '../types';
import { GMC_ROLES } from '@shared/types';

// Evidence screenshots -> R2. GMC only.
const uploads = new Hono<AppEnv>();
uploads.use('*', requireAuth);

uploads.post('/screenshot', requireRole(...GMC_ROLES), async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];
  if (!(file instanceof File)) return c.json({ error: 'No file' }, 400);
  if (file.size > 5 * 1024 * 1024)
    return c.json({ error: 'Max 5MB' }, 400);
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const key = `screenshots/${uuid()}.${ext}`;
  await c.env.SCREENSHOTS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'image/png' },
  });
  return c.json({ url: `/api/uploads/${key}` }, 201);
});

// Serve an uploaded screenshot back.
uploads.get('/screenshots/:name', async (c) => {
  const key = `screenshots/${c.req.param('name')}`;
  const obj = await c.env.SCREENSHOTS.get(key);
  if (!obj) return c.json({ error: 'Not found' }, 404);
  c.header('Content-Type', obj.httpMetadata?.contentType || 'image/png');
  c.header('Cache-Control', 'private, max-age=3600');
  return c.body(obj.body);
});

export default uploads;
