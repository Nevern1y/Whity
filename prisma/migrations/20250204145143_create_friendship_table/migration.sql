/*
  Warnings:

  - You are about to drop the column `isFriendsListPrivate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `friend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `friendships` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `isFriendsListPrivate`;

-- DropTable
DROP TABLE `friend`;

-- DropTable
DROP TABLE `friendships`;

-- CreateTable
CREATE TABLE `Friendship` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `status` ENUM('NONE', 'PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Friendship_senderId_receiverId_idx`(`senderId`, `receiverId`),
    INDEX `Friendship_status_idx`(`status`),
    UNIQUE INDEX `Friendship_senderId_receiverId_key`(`senderId`, `receiverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
