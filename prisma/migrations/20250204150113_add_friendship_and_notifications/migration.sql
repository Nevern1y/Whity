/*
  Warnings:

  - You are about to alter the column `status` on the `friendship` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(2))`.
  - You are about to drop the column `metadata` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `notifications` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Friendship_senderId_receiverId_idx` ON `friendship`;

-- DropIndex
DROP INDEX `Friendship_status_idx` ON `friendship`;

-- AlterTable
ALTER TABLE `friendship` MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `metadata`,
    DROP COLUMN `updatedAt`,
    MODIFY `message` VARCHAR(191) NOT NULL;
