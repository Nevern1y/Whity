/*
  Warnings:

  - You are about to drop the column `lastActiveAt` on the `userstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `lastStreakDate` on the `userstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `longestStreak` on the `userstatistics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `userstatistics` DROP COLUMN `lastActiveAt`,
    DROP COLUMN `lastStreakDate`,
    DROP COLUMN `longestStreak`,
    ADD COLUMN `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
