-- CreateEnum
CREATE TYPE "Dietary" AS ENUM ('veg', 'non_veg', 'vegan');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('counter', 'online');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'completed');

-- CreateEnum
CREATE TYPE "ItemTag" AS ENUM ('Spicy', 'Sweet', 'Bestseller', 'Chefs_Special', 'Healthy', 'Popular', 'New', 'Jain_Food', 'Signature_Dish');

-- CreateTable
CREATE TABLE "Cafe" (
    "id" SERIAL NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "openingTime" TEXT,
    "logoUrl" TEXT NOT NULL,
    "bannerUrl" TEXT NOT NULL,
    "payment_url" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "ipAddress" TEXT,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "gstNo" VARCHAR(15),
    "gstPercentage" INTEGER DEFAULT 5,
    "phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "instaID" TEXT,
    "rating" DECIMAL(65,30) DEFAULT 4.7,
    "reviews" INTEGER DEFAULT 969,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cafe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "cafeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" SERIAL NOT NULL,
    "cafeId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "food_image_url" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "dietary" "Dietary",
    "tags" "ItemTag",
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "tableNo" INTEGER NOT NULL,
    "cafeId" INTEGER NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'counter',
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "total_price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "specialInstructions" VARCHAR(500),
    "orderType" VARCHAR(50),
    "sessionToken" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_owner_id_key" ON "Cafe"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_slug_key" ON "Cafe"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_gstNo_key" ON "Cafe"("gstNo");

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_phone_key" ON "Cafe"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_email_key" ON "Cafe"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_cafeId_name_key" ON "Category"("cafeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicId_key" ON "Order"("publicId");

-- CreateIndex
CREATE INDEX "Order_sessionToken_idx" ON "Order"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_itemId_key" ON "OrderItem"("orderId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_orderId_key" ON "Bill"("orderId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
