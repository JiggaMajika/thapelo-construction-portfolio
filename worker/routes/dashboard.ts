import { Hono } from 'hono';
import { desc, eq, sql } from 'drizzle-orm';
import * as schema from '../db/schema';
import { requireAuth } from '../middleware';
import { computeSlaState } from '../lib/helpers';
import type { AppEnv } from '../types';
import type { AssignedTeam, Role } from '@shared/types';

const dashboard = new Hono<AppEnv>();
dashboard.use('*', requireAuth);

// Map a role to the team whose queue it should see first.
function teamForRole(role: Role): AssignedTeam | null {
  switch (role) {
    case 'gmc_admin':
    case 'gmc_analyst':
      return 'gmc';
    case 'appsumo_partnerships':
      return 'partnerships';
    case 'appsumo_support':
      return 'support';
    case 'appsumo_finance':
      return 'finance';
    case 'appsumo_exec':
      return 'leadership';
    default:
      return null;
  }
}

dashboard.get('/', async (c) => {
  const db = c.get('db');
  const { role } = c.get('auth');

  const allVendors = await db.query.vendors.findMany();
  const active = allVendors.filter((v) => !v.isArchived);
  const green = active.filter((v) => v.status === 'green').length;
  const amber = active.filter((v) => v.status === 'amber').length;
  const red = active.filter((v) => v.status === 'red').length;

  const openIssues = await db
    .select({
      issue: schema.issues,
      vendorName: schema.vendors.name,
      vendorSlug: schema.vendors.slug,
    })
    .from(schema.issues)
    .leftJoin(schema.vendors, eq(schema.issues.vendorId, schema.vendors.id))
    .where(sql`${schema.issues.boardStage} != 'resolved'`);

  const withSla = openIssues.map((r) => ({
    ...r.issue,
    vendorName: r.vendorName,
    vendorSlug: r.vendorSlug,
    slaState: computeSlaState(r.issue.detectedAt, r.issue.dueAt),
  }));

  const overdueCount = withSla.filter((i) => i.slaState === 'overdue').length;

  // Needs you now: assigned to the viewer's team, sorted by urgency.
  const team = teamForRole(role);
  const rank = { overdue: 0, due_soon: 1, on_track: 2 } as const;
  const needsYou = withSla
    .filter((i) => (team ? i.assignedTeam === team : true))
    .sort(
      (a, b) =>
        rank[a.slaState] - rank[b.slaState] ||
        (a.dueAt || '').localeCompare(b.dueAt || ''),
    )
    .slice(0, 8);

  // Decisions needing this role
  const pendingApprovals = await db.query.approvals.findMany({
    where: eq(schema.approvals.status, 'pending'),
  });
  const decisionsForYou =
    role === 'appsumo_exec' || role === 'appsumo_partnerships'
      ? pendingApprovals.length
      : 0;

  // Changed this week
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const changed = active
    .filter((v) => v.statusChangedAt && v.statusChangedAt >= weekAgo)
    .map((v) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      status: v.status,
      previousStatus: v.previousStatus,
    }));

  // Portfolio trend: last 12 weeks green/amber/red counts from score_history.
  const trend = await portfolioTrend(db);

  // Sliding watch: green vendors down 15+ pts in 30 days.
  const sliding = await slidingVendors(db, active);

  // Support: complaint themes this week
  const themes = await db
    .select({
      theme: schema.complaintThemes,
      vendorName: schema.vendors.name,
      vendorSlug: schema.vendors.slug,
    })
    .from(schema.complaintThemes)
    .leftJoin(
      schema.vendors,
      eq(schema.complaintThemes.vendorId, schema.vendors.id),
    )
    .orderBy(desc(schema.complaintThemes.weekStarting))
    .limit(12);

  const hasDemo = allVendors.some((v) => v.isDemoRecord);

  return c.json({
    stats: {
      total: active.length,
      green,
      amber,
      red,
      decisionsForYou,
      overdue: overdueCount,
    },
    needsYou,
    changed,
    trend,
    sliding,
    complaintThemes: themes.map((t) => ({
      ...t.theme,
      vendorName: t.vendorName,
      vendorSlug: t.vendorSlug,
    })),
    pendingPayouts: pendingApprovals
      .filter((a) => a.type === 'payout_hold')
      .map((a) => ({ id: a.id, title: a.title })),
    hasDemo,
  });
});

async function portfolioTrend(db: AppEnv['Variables']['db']) {
  // Bucket score_history rows into 12 weekly points.
  const rows = await db.query.scoreHistory.findMany({
    orderBy: (s, { asc }) => [asc(s.recordedAt)],
  });
  const byWeek = new Map<string, { green: number; amber: number; red: number }>();
  for (const r of rows) {
    const wk = r.recordedAt.slice(0, 10);
    if (!byWeek.has(wk)) byWeek.set(wk, { green: 0, amber: 0, red: 0 });
    const b = byWeek.get(wk)!;
    if (r.status === 'green') b.green++;
    else if (r.status === 'amber') b.amber++;
    else if (r.status === 'red') b.red++;
  }
  const weeks = [...byWeek.entries()]
    .map(([week, counts]) => ({ week, ...counts }))
    .slice(-12);
  return weeks;
}

async function slidingVendors(
  db: AppEnv['Variables']['db'],
  active: (typeof schema.vendors.$inferSelect)[],
) {
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
    if (h.recordedAt <= cutoff && !past.has(h.vendorId))
      past.set(h.vendorId, h.healthScore);
  }
  return active
    .filter((v) => v.status === 'green')
    .map((v) => {
      const prior = past.get(v.id);
      const change = prior != null ? v.healthScore - prior : 0;
      return { ...v, scoreChange: change };
    })
    .filter((v) => v.scoreChange <= -15)
    .sort((a, b) => a.scoreChange - b.scoreChange);
}

export default dashboard;
