/*
  Warnings:

  - Made the column `logoUrl` on table `Cafe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bannerUrl` on table `Cafe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payment_url` on table `Cafe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Cafe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gstNo` on table `Cafe` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Cafe_openingTime_key";

-- AlterTable
ALTER TABLE "Cafe" ALTER COLUMN "logoUrl" SET NOT NULL,
ALTER COLUMN "bannerUrl" SET NOT NULL,
ALTER COLUMN "payment_url" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "gstNo" SET NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL,
ALTER COLUMN "reviews" DROP NOT NULL;
