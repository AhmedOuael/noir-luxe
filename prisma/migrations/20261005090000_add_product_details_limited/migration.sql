-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "details" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "limited" BOOLEAN NOT NULL DEFAULT false;
