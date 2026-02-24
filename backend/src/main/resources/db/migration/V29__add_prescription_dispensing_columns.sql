-- =============================================================================
-- Migration V29: Add dispensing columns to clinical_prescription
-- These columns track when and by whom a prescription was dispensed
-- =============================================================================

ALTER TABLE clinical_prescription ADD COLUMN IF NOT EXISTS dispensed_at TIMESTAMPTZ;
ALTER TABLE clinical_prescription ADD COLUMN IF NOT EXISTS dispenser_user_id UUID REFERENCES identity_user(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ix_clinical_prescription_dispenser ON clinical_prescription(dispenser_user_id) WHERE dispenser_user_id IS NOT NULL;
