/*
  Warnings:

  - You are about to drop the `runners` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `order` to the `runs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "runners" DROP CONSTRAINT "runners_runId_fkey";

-- AlterTable
ALTER TABLE "runs" ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "runners" TEXT[];

-- DropTable
DROP TABLE "runners";
