-- Initial Cloudflare D1 Migration for Lovable Clone

CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`github_id` text NOT NULL UNIQUE,
	`username` text NOT NULL,
	`email` text,
	`avatar_url` text,
	`access_token` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text REFERENCES `users`(`id`) ON DELETE CASCADE,
	`title` text NOT NULL,
	`description` text,
	`github_repo` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL REFERENCES `projects`(`id`) ON DELETE CASCADE,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `project_files` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL REFERENCES `projects`(`id`) ON DELETE CASCADE,
	`path` text NOT NULL,
	`content` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS `project_path_idx` ON `project_files` (`project_id`, `path`);
