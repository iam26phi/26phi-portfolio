CREATE TABLE `photo_package_relations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoId` int NOT NULL,
	`packageId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photo_package_relations_id` PRIMARY KEY(`id`)
);
