import { Hono } from 'hono';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema';
import { requireAuth, requireRole } from '../middleware';
import { uuid } from '../auth/crypto';
import {
  computeSlaState,
  defaultIssueDue,
  logActivity,
  notify,
  nowIso,
} from '../lib/helpers';
import type { AppEnv } from '../types';
import { GMC_ROLES, BOARD_STAGE_LABELS } from '@shared/types';
import type { BoardStage } from '@shared/types';

const issues = new Hono<AppEnv>();
issues.use('*', requireAuth);

// Board / list feed: joins vendor + assignee, recomputes live SLA state.
issues.get('/', async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({
      issue: schema.issues,
      vendorName: schema.vendors.name,
      vendorSlug: schema.vendors.slug,
      assigneeName: schema.users.fullName,
    })
    .from(schema.issues)
    .leftJoin(schema.vendors, eq(schema.issues.vendorId, schema.vendors.id))
    .leftJoin(schema.users, eq(schema.issues.assignedUserId, schema.users.id))
    .orderBy(desc(schema.issues.createdAt));

  const out = rows.map((r) => ({
    ...r.issue,
    vendorName: r.vendorName,
    vendorSlug: r.vendorSlug,
    assigneeName: r.assigneeName,
    slaState: computeSlaState(r.issue.detectedAt, r.issue.dueAt),
  }));
  return c.json(out);
});

const issueSchema = z.object({
  vendorId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  failureMode: z.enum([
    'vanishing',
    'slow_death',
    'pivot',
    'paid_twice',
    'limit_creep',
    'bad_exit',
    'support_failure',
    'other',
  ]),
  severity: z.enum(['minor', 'notable', 'serious']),
  assignedTeam: z
    .enum(['gmc', 'partnerships', 'support', 'finance', 'leadership'])
    .optional(),
  assignedUserId: z.string().optional().nullable(),
});

issues.post('/', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const parsed = issueSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json({ error: 'Invalid issue', issues: parsed.error.issues }, 400);
  const d = parsed.data;
  const id = uuid();
  const detected = new Date();
  const dueAt = defaultIssueDue(d.severity, detected);
  await db.insert(schema.issues).values({
    id,
    vendorId: d.vendorId,
    title: d.title,
    description: d.description ?? null,
    failureMode: d.failureMode,
    severity: d.severity,
    boardStage: 'spotted',
    assignedTeam: d.assignedTeam ?? 'gmc',
    assignedUserId: d.assignedUserId ?? null,
    dueAt,
    slaState: 'on_track',
    detectedAt: detected.toISOString(),
    createdBy: auth.userId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  await logActivity(db, {
    userId: auth.userId,
    action: 'created_issue',
    parentType: 'issue',
    parentId: id,
    detail: d.title,
  });
  if (d.assignedUserId) {
    await notify(db, {
      userId: d.assignedUserId,
      type: 'assigned',
      title: 'Issue assigned to you',
      body: d.title,
      parentType: 'issue',
      parentId: id,
    });
  }
  return c.json({ id }, 201);
});

const moveSchema = z.object({
  boardStage: z.enum([
    'spotted',
    'confirmed',
    'with_appsumo',
    'vendor_contacted',
    'awaiting_vendor',
    'resolved',
  ]),
  resolutionNote: z.string().optional().nullable(),
});

// Move a card between stages, enforcing stage rules server-side.
issues.post('/:id/move', async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const id = c.req.param('id');
  const parsed = moveSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid move' }, 400);
  const target = parsed.data.boardStage as BoardStage;

  const issue = await db.query.issues.findFirst({
    where: eq(schema.issues.id, id),
  });
  if (!issue) return c.json({ error: 'Issue not found' }, 404);

  const isGmc = GMC_ROLES.includes(auth.role);

  // Only GMC can move Spotted -> Confirmed.
  if (issue.boardStage === 'spotted' && target === 'confirmed' && !isGmc) {
    return c.json({ error: 'Only GMC can confirm an issue' }, 403);
  }
  // Moving to Resolved requires a resolution note.
  if (target === 'resolved' && !parsed.data.resolutionNote?.trim()) {
    return c.json({ error: 'A resolution note is required to resolve' }, 400);
  }

  await db
    .update(schema.issues)
    .set({
      boardStage: target,
      resolutionNote:
        target === 'resolved' ? parsed.data.resolutionNote : issue.resolutionNote,
      resolvedAt: target === 'resolved' ? nowIso() : null,
      updatedAt: nowIso(),
    })
    .where(eq(schema.issues.id, id));

  await logActivity(db, {
    userId: auth.userId,
    action: 'moved_issue',
    parentType: 'issue',
    parentId: id,
    detail: `${BOARD_STAGE_LABELS[issue.boardStage as BoardStage]} → ${BOARD_STAGE_LABELS[target]}`,
  });
  // Also log against the vendor so it shows on the vendor History tab.
  await logActivity(db, {
    userId: auth.userId,
    action: 'issue_stage_change',
    parentType: 'vendor',
    parentId: issue.vendorId,
    detail: `${issue.title}: ${BOARD_STAGE_LABELS[target]}`,
  });

  // Moving to With AppSumo notifies the assigned team (approx: notify assignee).
  if (target === 'with_appsumo' && issue.assignedUserId) {
    await notify(db, {
      userId: issue.assignedUserId,
      type: 'assigned',
      title: 'Issue sent to AppSumo',
      body: issue.title,
      parentType: 'issue',
      parentId: id,
    });
  }
  return c.json({ ok: true });
});

const blockSchema = z.object({
  isBlocked: z.boolean(),
  blockedReason: z.string().optional().nullable(),
});

issues.post('/:id/block', async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  const id = c.req.param('id');
  const parsed = blockSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid' }, 400);
  await db
    .update(schema.issues)
    .set({
      isBlocked: parsed.data.isBlocked,
      blockedReason: parsed.data.isBlocked ? parsed.data.blockedReason : null,
      updatedAt: nowIso(),
    })
    .where(eq(schema.issues.id, id));
  await logActivity(db, {
    userId: auth.userId,
    action: parsed.data.isBlocked ? 'blocked_issue' : 'unblocked_issue',
    parentType: 'issue',
    parentId: id,
    detail: parsed.data.blockedReason,
  });
  return c.json({ ok: true });
});

issues.patch('/:id', requireRole(...GMC_ROLES), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const allowed = ['assignedUserId', 'assignedTeam', 'severity', 'description', 'title'];
  const set: Record<string, unknown> = { updatedAt: nowIso() };
  for (const k of allowed) if (k in body) set[k] = body[k];
  await db.update(schema.issues).set(set as any).where(eq(schema.issues.id, id));
  return c.json({ ok: true });
});

export default issues;
