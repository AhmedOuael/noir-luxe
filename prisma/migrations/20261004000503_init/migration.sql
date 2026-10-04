-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "productId" BIGINT NOT NULL,
    "categoryId" BIGINT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" BIGSERIAL NOT NULL,
    "productId" BIGINT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProductImage"
ADD CONSTRAINT "ProductImage_displayOrder_nonnegative"
CHECK ("displayOrder" >= 0);

CREATE UNIQUE INDEX "ProductImage_one_primary_per_product"
ON "ProductImage"("productId")
WHERE "isPrimary" = true;

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" BIGSERIAL NOT NULL,
    "productId" BIGINT NOT NULL,
    "color" TEXT,
    "size" TEXT,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "physicalStock" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProductVariant"
ADD CONSTRAINT "ProductVariant_price_nonnegative"
CHECK ("price" >= 0);

ALTER TABLE "ProductVariant"
ADD CONSTRAINT "ProductVariant_physicalStock_nonnegative"
CHECK ("physicalStock" >= 0);

ALTER TABLE "ProductVariant"
ADD CONSTRAINT "ProductVariant_reservedStock_nonnegative"
CHECK ("reservedStock" >= 0);

ALTER TABLE "ProductVariant"
ADD CONSTRAINT "ProductVariant_reservedStock_valid"
CHECK ("reservedStock" <= "physicalStock");

-- CreateTable
CREATE TABLE "Wilaya" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Wilaya_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" BIGSERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "wilayaId" BIGINT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" BIGSERIAL NOT NULL,
    "customerId" BIGINT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Order"
ADD CONSTRAINT "Order_subtotal_nonnegative"
CHECK ("subtotal" >= 0);

ALTER TABLE "Order"
ADD CONSTRAINT "Order_deliveryFee_nonnegative"
CHECK ("deliveryFee" >= 0);

ALTER TABLE "Order"
ADD CONSTRAINT "Order_discount_nonnegative"
CHECK ("discount" >= 0);

ALTER TABLE "Order"
ADD CONSTRAINT "Order_total_nonnegative"
CHECK ("total" >= 0);

ALTER TABLE "Order"
ADD CONSTRAINT "Order_total_calculation"
CHECK ("total" = "subtotal" + "deliveryFee" - "discount");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_status_valid"
CHECK ("status" IN (
  'NEW',
  'CALLED',
  'CONFIRMED',
  'PREPARING',
  'AT_DELIVERY_DESK',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELED',
  'CUSTOMER_UNREACHABLE',
  'REFUSED',
  'RETURNED'
));

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" BIGSERIAL NOT NULL,
    "orderId" BIGINT NOT NULL,
    "variantId" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" DECIMAL(10,2) NOT NULL,
    "productNameAtPurchase" TEXT NOT NULL,
    "colorAtPurchase" TEXT,
    "sizeAtPurchase" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_quantity_positive"
CHECK ("quantity" > 0);

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_price_nonnegative"
CHECK ("priceAtPurchase" >= 0);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" BIGSERIAL NOT NULL,
    "orderId" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "changedBy" BIGINT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "OrderStatusHistory"
ADD CONSTRAINT "OrderStatusHistory_status_valid"
CHECK ("status" IN (
  'NEW',
  'CALLED',
  'CONFIRMED',
  'PREPARING',
  'AT_DELIVERY_DESK',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELED',
  'CUSTOMER_UNREACHABLE',
  'REFUSED',
  'RETURNED'
));

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "ProductCategory_categoryId_productId_idx" ON "ProductCategory"("categoryId", "productId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_displayOrder_idx" ON "ProductImage"("productId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_product_color_size_key"
ON "ProductVariant"("productId", "color", "size")
NULLS NOT DISTINCT;
-- CreateIndex
CREATE UNIQUE INDEX "Wilaya_code_key" ON "Wilaya"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Wilaya_name_key" ON "Wilaya"("name");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_wilayaId_idx" ON "Customer"("wilayaId");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_changedBy_idx" ON "OrderStatusHistory"("changedBy");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "Wilaya"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
