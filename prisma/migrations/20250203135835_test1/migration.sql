/*
  Warnings:

  - You are about to drop the column `animations` on the `usersettings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `usersettings` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `userstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `lastActivityAt` on the `userstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `userstatistics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `usersettings` DROP COLUMN `animations`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `userstatistics` DROP COLUMN `createdAt`,
    DROP COLUMN `lastActivityAt`,
    DROP COLUMN `updatedAt`;

-- CreateTable
CREATE TABLE `uploads` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `uploads_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `UserSettings_userId_idx` ON `UserSettings`(`userId`);
