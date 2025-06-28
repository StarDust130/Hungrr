/*
  Warnings:

  - Made the column `email` on table `Cafe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Cafe` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cafe" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
