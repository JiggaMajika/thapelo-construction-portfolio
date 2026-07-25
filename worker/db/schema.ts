import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

// All ids are text UUIDs generated in the Worker.
// Timestamps stored as ISO-8601 text for simple, portable comparisons.

export const organisations = sqliteTable('organisations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'gmc' | 'client'
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(),
  organisationId: text('organisation_id')
    .notNull()
    .references(() => organisations.id),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash').notNull(),
  passwordSalt: text('password_salt').notNull(),
  failedLoginCount: integer('failed_login_count').notNull().default(0),
  lockedUntil: text('locked_until'),
  lastSeenAt: text('last_seen_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const vendors = sqliteTable(
  'vendors',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    companyName: text('company_name'),
    founderName: text('founder_name'),
    dealUrl: text('deal_url'),
    appUrl: text('app_url'),
    loginUrl: text('login_url'),
    changelogUrl: text('changelog_url'),
    supportEmail: text('support_email'),
    launchDate: text('launch_date'),
    tierCount: integer('tier_count'),
    priceRange: text('price_range'),
    monitoringGroup: text('monitoring_group').notNull().default('B'),
    healthScore: integer('health_score').notNull().default(50),
    status: text('status').notNull().default('amber'),
    previousStatus: text('previous_status'),
    statusChangedAt: text('status_changed_at'),
    lastVendorUpdateAt: text('last_vendor_update_at'),
    lastVendorReplyAt: text('last_vendor_reply_at'),
    badgeLevel: text('badge_level').notNull().default('none'),
    consecutiveGreenQuarters: integer('consecutive_green_quarters')
      .notNull()
      .default(0),
    payoutHeldPct: integer('payout_held_pct').notNull().default(0),
    isArchived: integer('is_archived', { mode: 'boolean' })
      .notNull()
      .default(false),
    isDemoRecord: integer('is_demo_record', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (t) => ({
    statusIdx: index('idx_vendors_status').on(t.status),
    slugIdx: index('idx_vendors_slug').on(t.slug),
  }),
);

export const scoreHistory = sqliteTable(
  'score_history',
  {
    id: text('id').primaryKey(),
    vendorId: text('vendor_id')
      .notNull()
      .references(() => vendors.id),
    recordedAt: text('recorded_at').notNull(),
    healthScore: integer('health_score').notNull(),
    status: text('status').notNull(),
    promiseComponent: integer('promise_component'),
    momentumComponent: integer('momentum_component'),
    livenessComponent: integer('liveness_component'),
    supportComponent: integer('support_component'),
    sentimentComponent: integer('sentiment_component'),
  },
  (t) => ({
    vendorIdx: index('idx_score_history_vendor').on(t.vendorId),
  }),
);

export const promises = sqliteTable(
  'promises',
  {
    id: text('id').primaryKey(),
    vendorId: text('vendor_id')
      .notNull()
      .references(() => vendors.id),
    promiseText: text('promise_text').notNull(),
    sourceType: text('source_type').notNull(),
    sourceUrl: text('source_url'),
    screenshotUrl: text('screenshot_url'),
    promisedOn: text('promised_on'),
    dueBy: text('due_by'),
    status: text('status').notNull().default('promised'),
    evidenceNote: text('evidence_note'),
    lastVerifiedAt: text('last_verified_at'),
    createdBy: text('created_by').references(() => users.id),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (t) => ({
    vendorIdx: index('idx_promises_vendor').on(t.vendorId),
    statusIdx: index('idx_promises_status').on(t.status),
  }),
);

export const issues = sqliteTable(
  'issues',
  {
    id: text('id').primaryKey(),
    vendorId: text('vendor_id')
      .notNull()
      .references(() => vendors.id),
    title: text('title').notNull(),
    description: text('description'),
    failureMode: text('failure_mode').notNull().default('other'),
    severity: text('severity').notNull().default('notable'),
    boardStage: text('board_stage').notNull().default('spotted'),
    assignedTeam: text('assigned_team').notNull().default('gmc'),
    assignedUserId: text('assigned_user_id').references(() => users.id),
    isBlocked: integer('is_blocked', { mode: 'boolean' })
      .notNull()
      .default(false),
    blockedReason: text('blocked_reason'),
    dueAt: text('due_at'),
    slaState: text('sla_state').notNull().default('on_track'),
    detectedAt: text('detected_at').notNull().default(sql`(datetime('now'))`),
    resolvedAt: text('resolved_at'),
    resolutionNote: text('resolution_note'),
    createdBy: text('created_by').references(() => users.id),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (t) => ({
    stageIdx: index('idx_issues_board_stage').on(t.boardStage),
    vendorIdx: index('idx_issues_vendor').on(t.vendorId),
  }),
);

export const evidence = sqliteTable('evidence', {
  id: text('id').primaryKey(),
  issueId: text('issue_id').references(() => issues.id),
  promiseId: text('promise_id').references(() => promises.id),
  label: text('label').notNull(),
  sourceUrl: text('source_url'),
  fileUrl: text('file_url'),
  capturedAt: text('captured_at'),
  beforeText: text('before_text'),
  afterText: text('after_text'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const comments = sqliteTable(
  'comments',
  {
    id: text('id').primaryKey(),
    parentType: text('parent_type').notNull(),
    parentId: text('parent_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    body: text('body').notNull(),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    editedAt: text('edited_at'),
  },
  (t) => ({
    parentIdx: index('idx_comments_parent').on(t.parentType, t.parentId),
  }),
);

export const approvals = sqliteTable('approvals', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  vendorId: text('vendor_id').references(() => vendors.id),
  title: text('title').notNull(),
  recommendation: text('recommendation').notNull(),
  rationale: text('rationale'),
  linkedIssueId: text('linked_issue_id').references(() => issues.id),
  status: text('status').notNull().default('pending'),
  requestedBy: text('requested_by').references(() => users.id),
  decidedBy: text('decided_by').references(() => users.id),
  decidedAt: text('decided_at'),
  decisionNote: text('decision_note'),
  dueAt: text('due_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const honoursLists = sqliteTable('honours_lists', {
  id: text('id').primaryKey(),
  month: text('month').notNull(), // first of month, ISO date
  title: text('title').notNull(),
  status: text('status').notNull().default('draft'),
  submittedAt: text('submitted_at'),
  approvedBy: text('approved_by').references(() => users.id),
  approvedAt: text('approved_at'),
  publishedAt: text('published_at'),
  dueAt: text('due_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const honoursEntries = sqliteTable('honours_entries', {
  id: text('id').primaryKey(),
  honoursListId: text('honours_list_id')
    .notNull()
    .references(() => honoursLists.id),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id),
  position: integer('position').notNull(),
  citation: text('citation'),
  isSwappedOut: integer('is_swapped_out', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const complaintThemes = sqliteTable('complaint_themes', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id),
  weekStarting: text('week_starting').notNull(),
  theme: text('theme').notNull(),
  mentionCount: integer('mention_count').notNull().default(0),
  sampleQuote: text('sample_quote'),
  isMatchedToPromise: integer('is_matched_to_promise', { mode: 'boolean' })
    .notNull()
    .default(false),
  matchedPromiseId: text('matched_promise_id').references(() => promises.id),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const unansweredQuestions = sqliteTable('unanswered_questions', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id),
  questionText: text('question_text').notNull(),
  sourceUrl: text('source_url'),
  askedOn: text('asked_on'),
  daysUnanswered: integer('days_unanswered').notNull().default(0),
  resolvedAt: text('resolved_at'),
});

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  periodStart: text('period_start'),
  periodEnd: text('period_end'),
  bodyMarkdown: text('body_markdown'),
  vendorId: text('vendor_id').references(() => vendors.id),
  publishedAt: text('published_at'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const activityLog = sqliteTable('activity_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  parentType: text('parent_type'),
  parentId: text('parent_id'),
  detail: text('detail'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const vendorFlags = sqliteTable('vendor_flags', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id),
  flaggedBy: text('flagged_by').references(() => users.id),
  note: text('note'),
  reviewedAt: text('reviewed_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  parentType: text('parent_type'),
  parentId: text('parent_id'),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const loginAttempts = sqliteTable('login_attempts', {
  id: text('id').primaryKey(),
  ip: text('ip').notNull(),
  windowStart: text('window_start').notNull(),
  count: integer('count').notNull().default(0),
});
