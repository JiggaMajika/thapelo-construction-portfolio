// Shared domain types & enums used by both the Worker API and the React frontend.

export type OrgType = 'gmc' | 'client';

export type Role =
  | 'gmc_admin'
  | 'gmc_analyst'
  | 'appsumo_exec'
  | 'appsumo_partnerships'
  | 'appsumo_support'
  | 'appsumo_finance';

export const ROLES: Role[] = [
  'gmc_admin',
  'gmc_analyst',
  'appsumo_exec',
  'appsumo_partnerships',
  'appsumo_support',
  'appsumo_finance',
];

export const ROLE_LABELS: Record<Role, string> = {
  gmc_admin: 'GMC Admin',
  gmc_analyst: 'GMC Analyst',
  appsumo_exec: 'AppSumo Exec',
  appsumo_partnerships: 'AppSumo Partnerships',
  appsumo_support: 'AppSumo Support',
  appsumo_finance: 'AppSumo Finance',
};

export const GMC_ROLES: Role[] = ['gmc_admin', 'gmc_analyst'];
export const APPROVER_ROLES: Role[] = ['appsumo_exec', 'appsumo_partnerships'];

export function isGmc(role: Role): boolean {
  return GMC_ROLES.includes(role);
}
export function canApprove(role: Role): boolean {
  return APPROVER_ROLES.includes(role);
}
export function canApproveHonours(role: Role): boolean {
  return role === 'appsumo_exec';
}
export function canManageUsers(role: Role): boolean {
  return role === 'gmc_admin';
}

export type VendorStatus = 'green' | 'amber' | 'red';
export type MonitoringGroup = 'A' | 'B' | 'C';
export type BadgeLevel = 'none' | 'bronze' | 'silver' | 'gold';

export type PromiseSourceType =
  | 'deal_page'
  | 'terms'
  | 'qa_comment'
  | 'founder_email'
  | 'roadmap';
export type PromiseStatus =
  | 'promised'
  | 'in_progress'
  | 'delivered'
  | 'overdue'
  | 'broken';

export type FailureMode =
  | 'vanishing'
  | 'slow_death'
  | 'pivot'
  | 'paid_twice'
  | 'limit_creep'
  | 'bad_exit'
  | 'support_failure'
  | 'other';

export const FAILURE_MODE_LABELS: Record<FailureMode, string> = {
  vanishing: 'Vanishing act',
  slow_death: 'Slow death',
  pivot: 'Pivot away',
  paid_twice: 'Paid twice',
  limit_creep: 'Limit creep',
  bad_exit: 'Bad exit',
  support_failure: 'Support failure',
  other: 'Other',
};

export type Severity = 'minor' | 'notable' | 'serious';

export type BoardStage =
  | 'spotted'
  | 'confirmed'
  | 'with_appsumo'
  | 'vendor_contacted'
  | 'awaiting_vendor'
  | 'resolved';

export const BOARD_STAGES: BoardStage[] = [
  'spotted',
  'confirmed',
  'with_appsumo',
  'vendor_contacted',
  'awaiting_vendor',
  'resolved',
];

export const BOARD_STAGE_LABELS: Record<BoardStage, string> = {
  spotted: 'Spotted',
  confirmed: 'Confirmed',
  with_appsumo: 'With AppSumo',
  vendor_contacted: 'Vendor contacted',
  awaiting_vendor: 'Awaiting vendor',
  resolved: 'Resolved',
};

export type AssignedTeam =
  | 'gmc'
  | 'partnerships'
  | 'support'
  | 'finance'
  | 'leadership';

export type SlaState = 'on_track' | 'due_soon' | 'overdue';

export type ApprovalType =
  | 'payout_hold'
  | 'formal_notice'
  | 'badge_change'
  | 'buyer_protection'
  | 'delisting'
  | 'other';

export const APPROVAL_TYPE_LABELS: Record<ApprovalType, string> = {
  payout_hold: 'Payout hold',
  formal_notice: 'Formal notice',
  badge_change: 'Badge change',
  buyer_protection: 'Buyer protection',
  delisting: 'Delisting',
  other: 'Other',
};

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'question_asked';

export type HonoursStatus = 'draft' | 'submitted' | 'approved' | 'published';

export type CommentParentType =
  | 'vendor'
  | 'issue'
  | 'promise'
  | 'approval'
  | 'honours_list';

export type ReportType = 'monday' | 'monthly' | 'quarterly' | 'evidence_pack';

export type NotificationType =
  | 'assigned'
  | 'mentioned'
  | 'approval_requested'
  | 'approval_decided'
  | 'item_overdue'
  | 'vendor_red';

// --- API DTOs (subset used across the UI) ---
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  organisationId: string;
  organisationName: string;
  organisationType: OrgType;
  avatarUrl: string | null;
}
