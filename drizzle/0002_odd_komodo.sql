CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`coverImage` text,
	`category` varchar(100),
	`tags` text,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`viewCount` int NOT NULL DEFAULT 0,
	`authorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
