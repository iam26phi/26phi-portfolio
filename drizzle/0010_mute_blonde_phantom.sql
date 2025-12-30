CREATE TABLE `photo_collaborators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoId` int NOT NULL,
	`collaboratorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photo_collaborators_id` PRIMARY KEY(`id`)
);
