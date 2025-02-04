/*
  Warnings:

  - You are about to alter the column `status` on the `friendship` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `friendship` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE `notifications`;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Friendship_senderId_idx` ON `Friendship`(`senderId`);

-- CreateIndex
CREATE INDEX `Friendship_receiverId_idx` ON `Friendship`(`receiverId`);
