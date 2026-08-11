CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon_url` text,
	`sort_index` integer,
	`is_pinned` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`meta` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE `categories_mangas` (
	`category_id` integer NOT NULL,
	`manga_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`sort_index` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_categories_mangas_manga_id` ON `categories_mangas` (`manga_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_mangas_category_id_manga_id_unique` ON `categories_mangas` (`category_id`,`manga_id`);--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`manga_source_id` text NOT NULL,
	`chapter_id` text NOT NULL,
	`chapter_number` text,
	`chapter_title` text,
	`language` text,
	`scanlator` text,
	`real_url` text,
	`is_bookmarked` integer DEFAULT false,
	`is_favorite` integer DEFAULT false,
	`is_downloaded` integer DEFAULT false,
	`is_read` integer DEFAULT false,
	`is_anonymous` integer DEFAULT false,
	`source_order` integer DEFAULT 0 NOT NULL,
	`is_hidden` integer DEFAULT false,
	`read_at` integer,
	`commentary` text,
	`page_cout` integer,
	`rating` real,
	`sort_index` integer,
	`fetched_at` integer NOT NULL,
	`uploadDate` integer NOT NULL,
	`meta` text DEFAULT '{}',
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_chapters_manga_source_id` ON `chapters` (`manga_source_id`);--> statement-breakpoint
CREATE INDEX `idx_chapters_source_id` ON `chapters` (`source_id`);--> statement-breakpoint
CREATE INDEX `idx_chapters_sort_index` ON `chapters` (`sort_index`);--> statement-breakpoint
CREATE INDEX `idx_chapters_is_read` ON `chapters` (`is_read`);--> statement-breakpoint
CREATE INDEX `idx_chapters_is_favorite` ON `chapters` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_chapters_is_anonymous` ON `chapters` (`is_anonymous`);--> statement-breakpoint
CREATE INDEX `idx_chapters_is_hidden` ON `chapters` (`is_hidden`);--> statement-breakpoint
CREATE INDEX `idx_chapters_read_at` ON `chapters` (`read_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `chapters_chapter_id_source_id_language_unique` ON `chapters` (`chapter_id`,`source_id`,`language`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon_url` text,
	`sort_index` integer,
	`is_pinned` integer DEFAULT false,
	`filters` text DEFAULT '[]',
	`orders` text DEFAULT '[]',
	`created_at` integer NOT NULL,
	`meta` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`level` text DEFAULT 'NORMAL' NOT NULL,
	`description` text NOT NULL,
	`note` text,
	`should_notify` integer DEFAULT false,
	`notified_at` integer,
	`logged_at` integer,
	`meta` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `idx_logs_kind` ON `logs` (`kind`);--> statement-breakpoint
CREATE INDEX `idx_logs_logged_at` ON `logs` (`logged_at`);--> statement-breakpoint
CREATE INDEX `idx_logs_should_notify` ON `logs` (`should_notify`);--> statement-breakpoint
CREATE UNIQUE INDEX `logs_kind_event_id_unique` ON `logs` (`kind`,`event_id`);--> statement-breakpoint
CREATE TABLE `mangas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug_title` text,
	`current_cover` text NOT NULL,
	`covers` text DEFAULT '[]',
	`is_favorite` integer DEFAULT false,
	`is_hidden` integer DEFAULT false,
	`is_anonymous` integer DEFAULT false,
	`auto_update` integer DEFAULT false,
	`notify_update` integer DEFAULT false,
	`source_origin` text DEFAULT '',
	`type` text DEFAULT 'manga',
	`notes` text,
	`commentary` text,
	`rating` real,
	`author` text,
	`artist` text,
	`reading_status` text,
	`status` text,
	`description` text,
	`other_titles` text DEFAULT '[]',
	`genre` text DEFAULT '[]' NOT NULL,
	`update_at` integer,
	`created_at` integer NOT NULL,
	`meta` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `idx_mangas_slug_titles` ON `mangas` (`slug_title`);--> statement-breakpoint
CREATE INDEX `idx_mangas_is_favorite` ON `mangas` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_mangas_is_hidden` ON `mangas` (`is_hidden`);--> statement-breakpoint
CREATE INDEX `idx_mangas_is_anonymous` ON `mangas` (`is_anonymous`);--> statement-breakpoint
CREATE INDEX `idx_mangas_created_at` ON `mangas` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_mangas_updated_at` ON `mangas` (`update_at`);--> statement-breakpoint
CREATE INDEX `idx_mangas_status` ON `mangas` (`reading_status`);--> statement-breakpoint
CREATE INDEX `idx_mangas_rating` ON `mangas` (`rating`);--> statement-breakpoint
CREATE TABLE `mangas_sources` (
	`manga_id` integer NOT NULL,
	`source_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`sort_index` integer,
	`meta` text DEFAULT '{}',
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_mangas_sources_manga_id` ON `mangas_sources` (`manga_id`);--> statement-breakpoint
CREATE INDEX `idx_mangas_sources_source_id` ON `mangas_sources` (`source_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `mangas_sources_manga_id_source_id_unique` ON `mangas_sources` (`manga_id`,`source_id`);--> statement-breakpoint
CREATE TABLE `saved_panels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_id` integer,
	`source_id` integer,
	`chapter_id` integer,
	`path` text NOT NULL,
	`title` text,
	`note` text,
	`page` text,
	`manga_title` text,
	`chapter_title` text,
	`chapter_number` text,
	`is_cropped` integer DEFAULT false,
	`is_favorite` integer DEFAULT false,
	`is_hidden` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`meta` text DEFAULT '{}',
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_saved_panels_manga_id` ON `saved_panels` (`manga_id`);--> statement-breakpoint
CREATE INDEX `idx_saved_panels_is_favorite` ON `saved_panels` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_saved_panels_is_hidden` ON `saved_panels` (`is_hidden`);--> statement-breakpoint
CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`cover_url` text,
	`banner_url` text,
	`description` text,
	`commentary` text,
	`rating` real,
	`author` text,
	`artist` text,
	`is_favorite` integer DEFAULT false,
	`is_hidden` integer DEFAULT false,
	`genre` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`update_at` integer,
	`meta` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `idx_series_is_favorite` ON `series` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_series_is_hidden` ON `series` (`is_hidden`);--> statement-breakpoint
CREATE TABLE `series_mangas` (
	`serie_id` integer NOT NULL,
	`manga_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`sort_index` integer,
	`meta` text DEFAULT '{}',
	PRIMARY KEY(`serie_id`, `manga_id`),
	FOREIGN KEY (`serie_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_series_mangas_manga_id` ON `series_mangas` (`manga_id`);--> statement-breakpoint
CREATE INDEX `idx_series_sort_index` ON `series_mangas` (`sort_index`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_name` text NOT NULL,
	`manga_source_id` text NOT NULL,
	`source_id` text NOT NULL,
	`extension_id` text NOT NULL,
	`iconUrl` text,
	`chapters_count` integer DEFAULT 0 NOT NULL,
	`unread_count` integer DEFAULT 0 NOT NULL,
	`bookmarked_count` integer DEFAULT 0 NOT NULL,
	`favorite_count` integer DEFAULT 0 NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`has_duplicate_chapters` integer DEFAULT false NOT NULL,
	`title` text NOT NULL,
	`language` text NOT NULL,
	`description` text,
	`author` text,
	`artist` text,
	`real_url` text NOT NULL,
	`status` text,
	`genre` text DEFAULT '[]' NOT NULL,
	`cover_url` text NOT NULL,
	`cover_url_last_fetched` integer,
	`chapters_last_fetched` integer,
	`last_fetched_chapter_number` text,
	`data_last_fetched` integer,
	`created_at` integer NOT NULL,
	`enabled` integer DEFAULT true,
	`is_hidden` integer DEFAULT false,
	`meta` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `idx_sources_enabled` ON `sources` (`enabled`);--> statement-breakpoint
CREATE INDEX `idx_sources_manga_source_id` ON `sources` (`manga_source_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sources_source_id_manga_source_id_unique` ON `sources` (`source_id`,`manga_source_id`);