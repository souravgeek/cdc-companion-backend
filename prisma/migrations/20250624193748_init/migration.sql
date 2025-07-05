-- CreateEnum
CREATE TYPE "Profile" AS ENUM ('CORE', 'CONSULT', 'DATA', 'FINANCE', 'FMCG', 'SDE_QUANT');

-- CreateTable
CREATE TABLE "Reviewee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,
    "email" TEXT,
    "cvLink" TEXT NOT NULL,
    "profile" "Profile" NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedToId" INTEGER,

    CONSTRAINT "Reviewee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reviewer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profiles" "Profile"[] DEFAULT ARRAY[]::"Profile"[],
    "maxQuota" INTEGER NOT NULL,
    "reviewedCount" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Reviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "comments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revieweeId" INTEGER NOT NULL,
    "reviewerId" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reviewee_rollNo_key" ON "Reviewee"("rollNo");

-- CreateIndex
CREATE UNIQUE INDEX "Reviewer_name_key" ON "Reviewer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Review_revieweeId_key" ON "Review"("revieweeId");

-- AddForeignKey
ALTER TABLE "Reviewee" ADD CONSTRAINT "Reviewee_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Reviewer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "Reviewee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Reviewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
