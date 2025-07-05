-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_cafeId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "order" INTEGER;

-- CreateIndex
CREATE INDEX "Category_cafeId_order_idx" ON "Category"("cafeId", "order");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
