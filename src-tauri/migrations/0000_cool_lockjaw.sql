CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon_url` text,
	`sort_index` integer,
	`is_pinned` integer DEFAULT false,
	`config` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE `category_mangas` (
	`category_id` integer NOT NULL,
	`manga_id` integer,
	`serie_id` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`serie_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_category_mangas_manga_id` ON `category_mangas` (`manga_id`);--> statement-breakpoint
CREATE INDEX `idx_category_mangas_serie_id` ON `category_mangas` (`serie_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_mangas_category_id_manga_id_unique` ON `category_mangas` (`category_id`,`manga_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_mangas_category_id_serie_id_unique` ON `category_mangas` (`category_id`,`serie_id`);--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_id` integer NOT NULL,
	`source_id` integer NOT NULL,
	`chapter_id` text NOT NULL,
	`sort_index` integer NOT NULL,
	`chapter_number` text,
	`chapter_title` text,
	`language` text DEFAULT '-',
	`is_favorite` integer DEFAULT false,
	`is_read` integer DEFAULT false,
	`is_anonymous` integer DEFAULT false,
	`is_hidden` integer DEFAULT false,
	`read_at` integer,
	`commentary` text,
	`rating` real,
	`update_at` integer NOT NULL,
	`config` text DEFAULT '{}',
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_chapters_manga_id` ON `chapters` (`manga_id`);--> statement-breakpoint
CREATE INDEX `idx_chapters_source_id` ON `chapters` (`source_id`);--> statement-breakpoint
CREATE INDEX `idx_chapters_sort_index` ON `chapters` (`sort_index`);--> statement-breakpoint
CREATE INDEX `idx_chapters_is_read` ON `chapters` (`is_read`);--> statement-breakpoint
CREATE INDEX `idx_chapters_is_favorite` ON `chapters` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_chapters_is_anonymous` ON `chapters` (`is_anonymous`);--> statement-breakpoint
CREATE INDEX `idx_chapters_is_hidden` ON `chapters` (`is_hidden`);--> statement-breakpoint
CREATE INDEX `idx_chapters_read_at` ON `chapters` (`read_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `chapters_chapter_id_source_id_language_manga_id_unique` ON `chapters` (`chapter_id`,`source_id`,`language`,`manga_id`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon_url` text,
	`sort_index` integer,
	`is_pinned` integer DEFAULT false,
	`filters` text DEFAULT '[]',
	`orders` text DEFAULT '[]',
	`config` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`note` text,
	`should_notify` integer DEFAULT false,
	`notified_at` integer,
	`logged_at` integer,
	`config` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `idx_logs_kind` ON `logs` (`kind`);--> statement-breakpoint
CREATE INDEX `idx_logs_logged_at` ON `logs` (`logged_at`);--> statement-breakpoint
CREATE INDEX `idx_logs_should_notify` ON `logs` (`should_notify`);--> statement-breakpoint
CREATE UNIQUE INDEX `logs_kind_event_id_unique` ON `logs` (`kind`,`event_id`);--> statement-breakpoint
CREATE TABLE `mangas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug_name` text,
	`current_cover` text NOT NULL,
	`covers` text DEFAULT '[]',
	`is_favorite` integer DEFAULT false,
	`is_hidden` integer DEFAULT false,
	`is_anonymous` integer DEFAULT false,
	`type` text DEFAULT 'manga',
	`notes` text,
	`commentary` text,
	`rating` real,
	`author` text,
	`artist` text,
	`status` text,
	`anilist_id` text,
	`mal_id` text,
	`description` text,
	`update_at` integer,
	`created_at` integer NOT NULL,
	`other_names` text DEFAULT '[]',
	`genre` text DEFAULT '[]' NOT NULL,
	`config` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `idx_mangas_slug_name` ON `mangas` (`slug_name`);--> statement-breakpoint
CREATE INDEX `idx_mangas_is_favorite` ON `mangas` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_mangas_is_hidden` ON `mangas` (`is_hidden`);--> statement-breakpoint
CREATE INDEX `idx_mangas_is_anonymous` ON `mangas` (`is_anonymous`);--> statement-breakpoint
CREATE INDEX `idx_mangas_created_at` ON `mangas` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_mangas_updated_at` ON `mangas` (`update_at`);--> statement-breakpoint
CREATE INDEX `idx_mangas_status` ON `mangas` (`status`);--> statement-breakpoint
CREATE INDEX `idx_mangas_rating` ON `mangas` (`rating`);--> statement-breakpoint
CREATE INDEX `idx_mangas_anilist_id` ON `mangas` (`anilist_id`);--> statement-breakpoint
CREATE INDEX `idx_mangas_mal_id` ON `mangas` (`mal_id`);--> statement-breakpoint
CREATE TABLE `saved_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_id` integer,
	`path` text NOT NULL,
	`title` text,
	`note` text,
	`manga_title` text,
	`chapter_title` text,
	`chapter_number` text,
	`is_favorite` integer DEFAULT false,
	`is_hidden` integer DEFAULT false,
	`config` text DEFAULT '{}',
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_saved_images_manga_id` ON `saved_images` (`manga_id`);--> statement-breakpoint
CREATE INDEX `idx_saved_images_is_favorite` ON `saved_images` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_saved_images_is_hidden` ON `saved_images` (`is_hidden`);--> statement-breakpoint
CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`cover_url` text,
	`description` text,
	`commentary` text,
	`author` text,
	`artist` text,
	`rating` real,
	`is_favorite` integer DEFAULT false,
	`is_hidden` integer DEFAULT false,
	`config` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `idx_series_is_favorite` ON `series` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_series_is_hidden` ON `series` (`is_hidden`);--> statement-breakpoint
CREATE TABLE `series_mangas` (
	`serie_id` integer NOT NULL,
	`manga_id` integer NOT NULL,
	`sort_index` integer NOT NULL,
	PRIMARY KEY(`serie_id`, `manga_id`),
	FOREIGN KEY (`serie_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_series_mangas_manga_id` ON `series_mangas` (`manga_id`);--> statement-breakpoint
CREATE INDEX `idx_series_sort_index` ON `series_mangas` (`sort_index`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_id` integer,
	`name` text NOT NULL,
	`manga_source_id` text NOT NULL,
	`source_id` text NOT NULL,
	`extension_id` text NOT NULL,
	`iconUrl` text,
	`real_url` text NOT NULL,
	`cover_url` text NOT NULL,
	`cover_url_last_fetched` integer,
	`last_fetched` integer,
	`status` text,
	`enabled` integer DEFAULT true,
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sources_manga_id` ON `sources` (`manga_id`);--> statement-breakpoint
CREATE INDEX `idx_sources_enabled` ON `sources` (`enabled`);