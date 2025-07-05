/*
  Warnings:

  - The values [FINANCE,FMCG,SDE_QUANT] on the enum `Profile` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Profile_new" AS ENUM ('CORE', 'CONSULT', 'DATA', 'FINANCE_QUANT', 'PRODUCT_FMCG', 'SOFTWARE');
ALTER TABLE "Reviewer" ALTER COLUMN "profiles" DROP DEFAULT;
ALTER TABLE "Reviewee" ALTER COLUMN "profile" TYPE "Profile_new" USING ("profile"::text::"Profile_new");
ALTER TABLE "Reviewer" ALTER COLUMN "profiles" TYPE "Profile_new"[] USING ("profiles"::text::"Profile_new"[]);
ALTER TYPE "Profile" RENAME TO "Profile_old";
ALTER TYPE "Profile_new" RENAME TO "Profile";
DROP TYPE "Profile_old";
ALTER TABLE "Reviewer" ALTER COLUMN "profiles" SET DEFAULT ARRAY[]::"Profile"[];
COMMIT;
