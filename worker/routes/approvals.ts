import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema';
import { requireAuth } from '../middleware';
import { uuid } from '../auth/crypto';
import {
  addWorkingDays,
  computeSlaState,
  logActivity,
  notify,
  nowIso,
} from '../lib/helpers';
import type { AppEnv } from '../types';
import { APPROVER_ROLES, GMC_ROLES } from '@shared/types';

const approvals = new Hono<AppEnv>();
approvals.use('*', requireAuth);

approvals.get('/', async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({
      approval: schema.approvals,
      vendorName: schema.vendors.name,
      vendorSlug: schema.vendors.slug,
      requesterName: schema.users.fullName,
    })
    .from(schema.approvals)
    .leftJoin(schema.vendors, eq(schema.approvals.vendorId, schema.vendors.id))
    .leftJoin(schema.users, eq(schema.approvals.requestedBy, schema.users.id))
    .orderBy(desc(schema.approvals.createdAt));
  return c.json(
    rows.map((r) => ({
      ...r.approval,
      vendorName: r.vendorName,
      vendorSlug: r.vendorSlug,
      requesterName: r.requesterName,
      slaState: computeSlaState(r.approval.createdAt, r.approval.dueAt),
    })),
  );
});

const createSchema = z.object({
  type: z.enum([
    'payout_hold',
    'formal_notice',
    'badge_change',
    'buyer_protection',
    'delisting',
    'other',
  ]),
  vendorId: z.string().optional().nullable(),
  title: z.string().min(1),
  recommendation: z.string().min(1),
  rationale: z.string().optional().nullable(),
  linkedIssueId: z.string().optional().nullable(),
});

approvals.post('/', requireAuth, async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  if (!GMC_ROLES.includes(auth.role))
    return c.json({ error: 'Only GMC can request approvals' }, 403);
  const parsed = createSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400);
  const d = parsed.data;
  const id = uuid();
  const dueAt = addWorkingDays(new Date(), 5).toISOString();
  await db.insert(schema.approvals).values({
    id,
    type: d.type,
    vendorId: d.vendorId ?? null,
    title: d.title,
    recommendation: d.recommendation,
    rationale: d.rationale ?? null,
    linkedIssueId: d.linkedIssueId ?? null,
    status: 'pending',
    requestedBy: auth.userId,
    dueAt,
    createdAt: nowIso(),
  });
  // Notify approvers.
  const approvers = await db.query.users.findMany();
  for (const u of approvers) {
    if (APPROVER_ROLES.includes(u.role as any)) {
      await notify(db, {
        userId: u.id,
        type: 'approval_requested',
        title: 'Approval requested',
        body: d.title,
        parentType: 'approval',
        parentId: id,
      });
    }
  }
  await logActivity(db, {
    userId: auth.userId,
    action: 'requested_approval',
    parentType: 'approval',
    parentId: id,
    detail: d.title,
  });
  return c.json({ id }, 201);
});

const decideSchema = z.object({
  decision: z.enum(['approved', 'declined', 'question_asked']),
  note: z.string().optional().nullable(),
});

approvals.post('/:id/decide', async (c) => {
  const db = c.get('db');
  const auth = c.get('auth');
  if (!APPROVER_ROLES.includes(auth.role))
    return c.json({ error: 'You cannot decide approvals' }, 403);
  const id = c.req.param('id');
  const parsed = decideSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid' }, 400);
  const d = parsed.data;
  // Approve / Decline require a note.
  if (
    (d.decision === 'approved' || d.decision === 'declined') &&
    !d.note?.trim()
  ) {
    return c.json({ error: 'A short note is required' }, 400);
  }
  const appr = await db.query.approvals.findFirst({
    where: eq(schema.approvals.id, id),
  });
  if (!appr) return c.json({ error: 'Not found' }, 404);

  if (d.decision === 'question_asked') {
    // Post a comment and set status.
    await db.insert(schema.comments).values({
      id: uuid(),
      parentType: 'approval',
      parentId: id,
      userId: auth.userId,
      body: d.note?.trim() || 'A question was raised.',
      createdAt: nowIso(),
    });
    await db
      .update(schema.approvals)
      .set({ status: 'question_asked' })
      .where(eq(schema.approvals.id, id));
  } else {
    await db
      .update(schema.approvals)
      .set({
        status: d.decision,
        decidedBy: auth.userId,
        decidedAt: nowIso(),
        decisionNote: d.note,
      })
      .where(eq(schema.approvals.id, id));
  }

  if (appr.requestedBy) {
    await notify(db, {
      userId: appr.requestedBy,
      type: 'approval_decided',
      title: `Approval ${d.decision.replace('_', ' ')}`,
      body: appr.title,
      parentType: 'approval',
      parentId: id,
    });
  }
  await logActivity(db, {
    userId: auth.userId,
    action: `approval_${d.decision}`,
    parentType: 'approval',
    parentId: id,
    detail: appr.title,
  });
  return c.json({ ok: true });
});

export default approvals;
