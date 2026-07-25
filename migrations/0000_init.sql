CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`parent_type` text,
	`parent_id` text,
	`detail` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`vendor_id` text,
	`title` text NOT NULL,
	`recommendation` text NOT NULL,
	`rationale` text,
	`linked_issue_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`requested_by` text,
	`decided_by` text,
	`decided_at` text,
	`decision_note` text,
	`due_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`linked_issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`decided_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_type` text NOT NULL,
	`parent_id` text NOT NULL,
	`user_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`edited_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `complaint_themes` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`week_starting` text NOT NULL,
	`theme` text NOT NULL,
	`mention_count` integer DEFAULT 0 NOT NULL,
	`sample_quote` text,
	`is_matched_to_promise` integer DEFAULT false NOT NULL,
	`matched_promise_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`matched_promise_id`) REFERENCES `promises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text,
	`promise_id` text,
	`label` text NOT NULL,
	`source_url` text,
	`file_url` text,
	`captured_at` text,
	`before_text` text,
	`after_text` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`promise_id`) REFERENCES `promises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `honours_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`honours_list_id` text NOT NULL,
	`vendor_id` text NOT NULL,
	`position` integer NOT NULL,
	`citation` text,
	`is_swapped_out` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`honours_list_id`) REFERENCES `honours_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `honours_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`submitted_at` text,
	`approved_by` text,
	`approved_at` text,
	`published_at` text,
	`due_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`failure_mode` text DEFAULT 'other' NOT NULL,
	`severity` text DEFAULT 'notable' NOT NULL,
	`board_stage` text DEFAULT 'spotted' NOT NULL,
	`assigned_team` text DEFAULT 'gmc' NOT NULL,
	`assigned_user_id` text,
	`is_blocked` integer DEFAULT false NOT NULL,
	`blocked_reason` text,
	`due_at` text,
	`sla_state` text DEFAULT 'on_track' NOT NULL,
	`detected_at` text DEFAULT (datetime('now')) NOT NULL,
	`resolved_at` text,
	`resolution_note` text,
	`created_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`ip` text NOT NULL,
	`window_start` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`parent_type` text,
	`parent_id` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organisations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `promises` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`promise_text` text NOT NULL,
	`source_type` text NOT NULL,
	`source_url` text,
	`screenshot_url` text,
	`promised_on` text,
	`due_by` text,
	`status` text DEFAULT 'promised' NOT NULL,
	`evidence_note` text,
	`last_verified_at` text,
	`created_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`period_start` text,
	`period_end` text,
	`body_markdown` text,
	`vendor_id` text,
	`published_at` text,
	`created_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `score_history` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`recorded_at` text NOT NULL,
	`health_score` integer NOT NULL,
	`status` text NOT NULL,
	`promise_component` integer,
	`momentum_component` integer,
	`liveness_component` integer,
	`support_component` integer,
	`sentiment_component` integer,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `unanswered_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`question_text` text NOT NULL,
	`source_url` text,
	`asked_on` text,
	`days_unanswered` integer DEFAULT 0 NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text NOT NULL,
	`organisation_id` text NOT NULL,
	`avatar_url` text,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`failed_login_count` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`last_seen_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vendor_flags` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`flagged_by` text,
	`note` text,
	`reviewed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flagged_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`company_name` text,
	`founder_name` text,
	`deal_url` text,
	`app_url` text,
	`login_url` text,
	`changelog_url` text,
	`support_email` text,
	`launch_date` text,
	`tier_count` integer,
	`price_range` text,
	`monitoring_group` text DEFAULT 'B' NOT NULL,
	`health_score` integer DEFAULT 50 NOT NULL,
	`status` text DEFAULT 'amber' NOT NULL,
	`previous_status` text,
	`status_changed_at` text,
	`last_vendor_update_at` text,
	`last_vendor_reply_at` text,
	`badge_level` text DEFAULT 'none' NOT NULL,
	`consecutive_green_quarters` integer DEFAULT 0 NOT NULL,
	`payout_held_pct` integer DEFAULT 0 NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`is_demo_record` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_comments_parent` ON `comments` (`parent_type`,`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_issues_board_stage` ON `issues` (`board_stage`);--> statement-breakpoint
CREATE INDEX `idx_issues_vendor` ON `issues` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `idx_promises_vendor` ON `promises` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `idx_promises_status` ON `promises` (`status`);--> statement-breakpoint
CREATE INDEX `idx_score_history_vendor` ON `score_history` (`vendor_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `vendors_slug_unique` ON `vendors` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_vendors_status` ON `vendors` (`status`);--> statement-breakpoint
CREATE INDEX `idx_vendors_slug` ON `vendors` (`slug`);