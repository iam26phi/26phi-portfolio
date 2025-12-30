CREATE TABLE `hero_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`textZh` text NOT NULL,
	`textEn` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hero_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hero_slides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` text NOT NULL,
	`title` varchar(200),
	`isActive` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hero_slides_id` PRIMARY KEY(`id`)
);
