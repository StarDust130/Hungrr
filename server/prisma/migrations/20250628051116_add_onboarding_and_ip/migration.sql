/*
  Warnings:

  - A unique constraint covering the columns `[owner_id]` on the table `Cafe` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cafe" ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_owner_id_key" ON "Cafe"("owner_id");
