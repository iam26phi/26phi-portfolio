CREATE TABLE `collaborators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`avatar` text,
	`website` varchar(255),
	`instagram` varchar(100),
	`email` varchar(320),
	`isVisible` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collaborators_id` PRIMARY KEY(`id`),
	CONSTRAINT `collaborators_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `photos` ADD `collaboratorId` int;