/*
  Warnings:

  - Added the required column `username` to the `UserDiscord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserDiscord" ADD COLUMN     "username" VARCHAR(255) NOT NULL;
