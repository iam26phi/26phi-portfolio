CREATE TABLE `photo_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photo_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `photo_categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `photo_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `photos` MODIFY COLUMN `category` varchar(100) NOT NULL;