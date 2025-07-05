/*
  Warnings:

  - The `profiles` column on the `Reviewer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `profile` on the `Reviewee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Reviewee" DROP COLUMN "profile",
ADD COLUMN     "profile" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reviewer" DROP COLUMN "profiles",
ADD COLUMN     "profiles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "Profile";
