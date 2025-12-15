CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`src` text NOT NULL,
	`alt` text NOT NULL,
	`category` enum('Portrait','Travel','Editorial') NOT NULL,
	`location` varchar(255),
	`date` varchar(50),
	`description` text,
	`isVisible` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
