/*
  Warnings:

  - You are about to drop the column `maxQuota` on the `Reviewer` table. All the data in the column will be lost.
  - Added the required column `reviewsNumber` to the `Reviewer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reviewer" DROP COLUMN "maxQuota",
ADD COLUMN     "reviewsNumber" INTEGER NOT NULL;
