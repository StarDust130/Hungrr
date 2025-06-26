/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Cafe` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Cafe` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cafe" ADD COLUMN     "email" VARCHAR(100),
ADD COLUMN     "gstPercentage" INTEGER DEFAULT 5,
ADD COLUMN     "phone" VARCHAR(15),
ALTER COLUMN "gstNo" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_phone_key" ON "Cafe"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_email_key" ON "Cafe"("email");
