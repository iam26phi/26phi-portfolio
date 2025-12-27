CREATE TABLE `changelogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(50) NOT NULL,
	`date` timestamp NOT NULL,
	`description` text NOT NULL,
	`type` enum('feature','improvement','bugfix','design') NOT NULL DEFAULT 'feature',
	`isVisible` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `changelogs_id` PRIMARY KEY(`id`)
);
