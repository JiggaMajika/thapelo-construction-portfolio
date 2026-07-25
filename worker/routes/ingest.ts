import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { uuid } from '../auth/crypto';
import { nowIso, slugify } from '../lib/helpers';
import type { AppEnv } from '../types';

// The ONLY automated entry point. GMC's monitoring engine (outside this
// codebase) POSTs here with a bearer token. Everything else is manual entry.
const ingest = new Hono<AppEnv>();

const payloadSchema = z.object({
  vendors: z
    .array(
      z.object({
        name: z.string(),
        slug: z.string().optional(),
        status: z.enum(['green', 'amber', 'red']).optional(),
        healthScore: z.number().int().min(0).max(100).optional(),
        companyName: z.string().optional(),
      }),
    )
    .optional(),
  scoreHistory: z
    .array(
      z.object({
        vendorSlug: z.string(),
        recordedAt: z.string(),
        healthScore: z.number().int(),
        status: z.enum(['green', 'amber', 'red']),
      }),
    )
    .optional(),
  issues: z
    .array(
      z.object({
        vendorSlug: z.string(),
        title: z.string(),
        severity: z.enum(['minor', 'notable', 'serious']).optional(),
        failureMode: z.string().optional(),
      }),
    )
    .optional(),
  promises: z
    .array(
      z.object({
        vendorSlug: z.string(),
        promiseText: z.string(),
        sourceType: z.string(),
        status: z.string().optional(),
      }),
    )
    .optional(),
  complaintThemes: z
    .array(
      z.object({
        vendorSlug: z.string(),
        weekStarting: z.string(),
        theme: z.string(),
        mentionCount: z.number().int(),
        sampleQuote: z.string().optional(),
      }),
    )
    .optional(),
});

ingest.post('/', async (c) => {
  const authz = c.req.header('authorization') || '';
  const token = authz.replace(/^Bearer\s+/i, '');
  if (!token || token !== c.env.INGEST_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const parsed = payloadSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json({ error: 'Invalid payload', issues: parsed.error.issues }, 400);

  const db = drizzle(c.env.DB, { schema });
  const written = { vendors: 0, scoreHistory: 0, issues: 0, promises: 0, complaintThemes: 0 };

  async function vendorIdBySlug(slug: string): Promise<string | null> {
    const v = await db.query.vendors.findFirst({
      where: eq(schema.vendors.slug, slug),
    });
    return v?.id ?? null;
  }

  for (const v of parsed.data.vendors ?? []) {
    const slug = v.slug || slugify(v.name);
    const existing = await db.query.vendors.findFirst({
      where: eq(schema.vendors.slug, slug),
    });
    if (existing) {
      await db
        .update(schema.vendors)
        .set({
          status: v.status ?? existing.status,
          previousStatus:
            v.status && v.status !== existing.status
              ? existing.status
              : existing.previousStatus,
          statusChangedAt:
            v.status && v.status !== existing.status
              ? nowIso()
              : existing.statusChangedAt,
          healthScore: v.healthScore ?? existing.healthScore,
          updatedAt: nowIso(),
        })
        .where(eq(schema.vendors.id, existing.id));
    } else {
      await db.insert(schema.vendors).values({
        id: uuid(),
        name: v.name,
        slug,
        companyName: v.companyName ?? null,
        status: v.status ?? 'amber',
        healthScore: v.healthScore ?? 50,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }
    written.vendors++;
  }

  for (const s of parsed.data.scoreHistory ?? []) {
    const vid = await vendorIdBySlug(s.vendorSlug);
    if (!vid) continue;
    await db.insert(schema.scoreHistory).values({
      id: uuid(),
      vendorId: vid,
      recordedAt: s.recordedAt,
      healthScore: s.healthScore,
      status: s.status,
    });
    written.scoreHistory++;
  }

  for (const i of parsed.data.issues ?? []) {
    const vid = await vendorIdBySlug(i.vendorSlug);
    if (!vid) continue;
    await db.insert(schema.issues).values({
      id: uuid(),
      vendorId: vid,
      title: i.title,
      severity: i.severity ?? 'notable',
      failureMode: (i.failureMode as any) ?? 'other',
      boardStage: 'spotted',
      detectedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    written.issues++;
  }

  for (const p of parsed.data.promises ?? []) {
    const vid = await vendorIdBySlug(p.vendorSlug);
    if (!vid) continue;
    await db.insert(schema.promises).values({
      id: uuid(),
      vendorId: vid,
      promiseText: p.promiseText,
      sourceType: p.sourceType as any,
      status: (p.status as any) ?? 'promised',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    written.promises++;
  }

  for (const t of parsed.data.complaintThemes ?? []) {
    const vid = await vendorIdBySlug(t.vendorSlug);
    if (!vid) continue;
    await db.insert(schema.complaintThemes).values({
      id: uuid(),
      vendorId: vid,
      weekStarting: t.weekStarting,
      theme: t.theme,
      mentionCount: t.mentionCount,
      sampleQuote: t.sampleQuote ?? null,
      createdAt: nowIso(),
    });
    written.complaintThemes++;
  }

  return c.json({ ok: true, written });
});

export default ingest;
