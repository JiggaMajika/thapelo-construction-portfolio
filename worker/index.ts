import { Hono } from 'hono';
import { withDb } from './middleware';
import { runWeeklyBackup } from './lib/backup';
import type { Env, AppEnv } from './types';

import auth from './routes/auth';
import vendors from './routes/vendors';
import promises from './routes/promises';
import issues from './routes/issues';
import comments from './routes/comments';
import notifications from './routes/notifications';
import approvals from './routes/approvals';
import honours from './routes/honours';
import dashboard from './routes/dashboard';
import support from './routes/support';
import reports from './routes/reports';
import uploads from './routes/uploads';
import ingest from './routes/ingest';
import admin from './routes/admin';
import { search, activity, users, orgs } from './routes/misc';

const app = new Hono<AppEnv>();

// Drizzle on every request.
app.use('/api/*', withDb);

const api = new Hono<AppEnv>();
api.route('/auth', auth);
api.route('/vendors', vendors);
api.route('/promises', promises);
api.route('/issues', issues);
api.route('/comments', comments);
api.route('/notifications', notifications);
api.route('/approvals', approvals);
api.route('/honours', honours);
api.route('/dashboard', dashboard);
api.route('/support', support);
api.route('/reports', reports);
api.route('/uploads', uploads);
api.route('/ingest', ingest);
api.route('/admin', admin);
api.route('/search', search);
api.route('/activity', activity);
api.route('/users', users);
api.route('/orgs', orgs);

api.get('/health', (c) => c.json({ ok: true, app: c.env.APP_NAME }));

app.route('/api', api);

// Non-/api requests: serve the built SPA (Pages/assets binding handles this in
// production; in `wrangler dev` the ASSETS binding serves dist).
app.get('*', async (c) => {
  if (c.env.ASSETS) return c.env.ASSETS.fetch(c.req.raw);
  return c.text('The Bridge API. Frontend served separately in dev.', 200);
});

export default {
  fetch: app.fetch,
  // Weekly backup cron -> R2.
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runWeeklyBackup(env));
  },
} satisfies ExportedHandler<Env>;
