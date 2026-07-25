import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import type { Env } from '../types';

// Export every table to a single JSON object. Shared by the weekly cron and
// the admin "Export everything" button. Sensitive auth columns are omitted.
export async function exportAll(env: Env): Promise<Record<string, unknown>> {
  const db = drizzle(env.DB, { schema });
  const users = await db.query.users.findMany();
  return {
    exportedAt: new Date().toISOString(),
    organisations: await db.query.organisations.findMany(),
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      organisationId: u.organisationId,
      lastSeenAt: u.lastSeenAt,
      createdAt: u.createdAt,
    })),
    vendors: await db.query.vendors.findMany(),
    scoreHistory: await db.query.scoreHistory.findMany(),
    promises: await db.query.promises.findMany(),
    issues: await db.query.issues.findMany(),
    evidence: await db.query.evidence.findMany(),
    comments: await db.query.comments.findMany(),
    approvals: await db.query.approvals.findMany(),
    honoursLists: await db.query.honoursLists.findMany(),
    honoursEntries: await db.query.honoursEntries.findMany(),
    complaintThemes: await db.query.complaintThemes.findMany(),
    unansweredQuestions: await db.query.unansweredQuestions.findMany(),
    reports: await db.query.reports.findMany(),
    activityLog: await db.query.activityLog.findMany(),
    vendorFlags: await db.query.vendorFlags.findMany(),
    notifications: await db.query.notifications.findMany(),
  };
}

export async function runWeeklyBackup(env: Env): Promise<string> {
  const data = await exportAll(env);
  const date = new Date().toISOString().slice(0, 10);
  const key = `backups/${date}.json`;
  await env.BACKUPS.put(key, JSON.stringify(data), {
    httpMetadata: { contentType: 'application/json' },
  });
  return key;
}
