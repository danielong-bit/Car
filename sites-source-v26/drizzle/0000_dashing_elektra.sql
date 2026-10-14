CREATE TABLE IF NOT EXISTS `cms_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cms_enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cms_media` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`bytes` integer NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cms_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cms_views` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`day` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `vehicle_media` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`stock_id` text NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`variant` text DEFAULT '' NOT NULL,
	`year` integer,
	`price_rm` integer,
	`mileage_km` integer,
	`body` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `vehicles_stock_id_unique` ON `vehicles` (`stock_id`);