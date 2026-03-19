-- Migration V13: Remove billing-related tables
-- These tables are no longer needed as the billing functionality has been removed from the system.

DROP TABLE IF EXISTS billing_invoice_item CASCADE;
DROP TABLE IF EXISTS billing_invoice CASCADE;

-- Optional: Remove medical_service if it was only used for billing
-- DROP TABLE IF EXISTS medical_service CASCADE;
