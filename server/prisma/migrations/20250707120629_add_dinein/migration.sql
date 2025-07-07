/*
  Warnings:

  - The values [dine_in] on the enum `OrderType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderType_new" AS ENUM ('dinein', 'takeaway');
ALTER TABLE "Order" ALTER COLUMN "orderType" TYPE "OrderType_new" USING ("orderType"::text::"OrderType_new");
ALTER TYPE "OrderType" RENAME TO "OrderType_old";
ALTER TYPE "OrderType_new" RENAME TO "OrderType";
DROP TYPE "OrderType_old";
COMMIT;
