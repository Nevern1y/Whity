-- AlterTable
ALTER TABLE `users` ADD COLUMN `isFriendsListPrivate` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Friend` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `friendId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Friend_userId_friendId_key`(`userId`, `friendId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
