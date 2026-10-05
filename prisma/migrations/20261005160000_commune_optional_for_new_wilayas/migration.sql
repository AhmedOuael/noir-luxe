-- The 2025 wilayas (59-69) have no communes yet, so a commune can't be
-- required at the DB level any more. The app requires one whenever the
-- order's wilaya has communes; the DB still requires an address for home delivery.
ALTER TABLE "Order" DROP CONSTRAINT "Order_destination_complete";

ALTER TABLE "Order"
ADD CONSTRAINT "Order_destination_complete"
CHECK (
  "status" IN ('NEW', 'CALLED', 'CUSTOMER_UNREACHABLE', 'CANCELED')
  OR "deliveryType" = 'STOP_DESK'
  OR "address" IS NOT NULL
);
