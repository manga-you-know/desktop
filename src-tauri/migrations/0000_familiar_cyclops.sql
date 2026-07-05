CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`note` text,
	`logged_at` integer
);
--> statement-breakpoint
CREATE TABLE `mangas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug_name` text NOT NULL,
	`current_cover` text NOT NULL,
	`covers` text DEFAULT '[]',
	`is_favorite` integer DEFAULT false,
	`type` text DEFAULT 'manga',
	`grade` real DEFAULT 0,
	`author` text DEFAULT '-',
	`artist` text DEFAULT '-',
	`status` text DEFAULT '-',
	`anilist_id` text DEFAULT '',
	`mal_id` text DEFAULT '',
	`description` text DEFAULT '',
	`configs` text DEFAULT '{}',
	`other_names` text DEFAULT '[]',
	`genre` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_id` integer,
	`name` text NOT NULL,
	`manga_source_id` text NOT NULL,
	`source_id` text NOT NULL,
	`extension_id` text NOT NULL,
	`source_cover` text,
	`real_url` text NOT NULL,
	`cover_url` text NOT NULL,
	`cover_url_last_fetched` integer,
	`last_fetched` integer,
	`status` text,
	`enabled` integer DEFAULT true,
	FOREIGN KEY (`manga_id`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE no action
);
