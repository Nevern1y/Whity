/*
  Warnings:

  - You are about to alter the column `status` on the `friendship` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to drop the column `endTime` on the `studysession` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `studysession` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.
  - You are about to drop the column `fontSize` on the `usersettings` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `usersettings` table. All the data in the column will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `requirement` to the `achievements` table without a default value. This is not possible if the table is not empty.
  - Made the column `duration` on table `studysession` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `UserSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserStatistics` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Friendship_senderId_receiverId_key` ON `friendship`;

-- DropIndex
DROP INDEX `UserSettings_userId_idx` ON `usersettings`;

-- AlterTable
ALTER TABLE `achievements` ADD COLUMN `requirement` INTEGER NOT NULL,
    ADD COLUMN `xpReward` INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE `friendship` MODIFY `status` ENUM('NONE', 'PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE `studysession` DROP COLUMN `endTime`,
    DROP COLUMN `startTime`,
    ADD COLUMN `completed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `courseId` VARCHAR(191) NULL,
    MODIFY `duration` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE `usersettings` DROP COLUMN `fontSize`,
    DROP COLUMN `theme`,
    ADD COLUMN `company` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `notifications` JSON NULL DEFAULT {"email":true,"push":false,"sounds":true,"updates":true,"newsletter":false};

-- AlterTable
ALTER TABLE `userstatistics` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dailyGoal` INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN `lastRewardDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `lastStudyDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `level` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `longestStreak` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `monthlyGoal` INTEGER NOT NULL DEFAULT 600,
    ADD COLUMN `studyHistory` JSON NULL,
    ADD COLUMN `totalXP` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `weeklyGoal` INTEGER NOT NULL DEFAULT 150;

-- DropTable
DROP TABLE `notification`;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `metadata` JSON NULL,

    INDEX `notifications_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
