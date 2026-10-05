-- Note: deliberately does NOT drop "ProductVariant_product_color_size_key"
-- (custom NULLS NOT DISTINCT index that Prisma's schema can't express).

BEGIN;

-- CreateTable
CREATE TABLE "Commune" (
    "id" BIGSERIAL NOT NULL,
    "wilayaId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Commune_pkey" PRIMARY KEY ("id")
);

-- AlterTable
-- Fails if "Order" already has rows (no default for the NOT NULL columns).
ALTER TABLE "Order" ADD COLUMN     "address" TEXT,
ADD COLUMN     "communeId" BIGINT,
ADD COLUMN     "deliveryType" TEXT NOT NULL,
ADD COLUMN     "wilayaId" BIGINT NOT NULL;

ALTER TABLE "Order"
ADD CONSTRAINT "Order_deliveryType_valid"
CHECK ("deliveryType" IN ('HOME', 'STOP_DESK'));

-- Commune (and address for home delivery) are filled during the confirmation
-- call, so they're only required once the order moves past the call stage.
ALTER TABLE "Order"
ADD CONSTRAINT "Order_destination_complete"
CHECK (
  "status" IN ('NEW', 'CALLED', 'CUSTOMER_UNREACHABLE', 'CANCELED')
  OR (
    "communeId" IS NOT NULL
    AND ("deliveryType" = 'STOP_DESK' OR "address" IS NOT NULL)
  )
);

-- CreateIndex
CREATE UNIQUE INDEX "Commune_wilayaId_name_key" ON "Commune"("wilayaId", "name");

-- CreateIndex
CREATE INDEX "Order_wilayaId_idx" ON "Order"("wilayaId");

-- CreateIndex
CREATE INDEX "Order_communeId_idx" ON "Order"("communeId");

-- AddForeignKey
ALTER TABLE "Commune" ADD CONSTRAINT "Commune_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "Wilaya"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "Wilaya"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "Commune"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
