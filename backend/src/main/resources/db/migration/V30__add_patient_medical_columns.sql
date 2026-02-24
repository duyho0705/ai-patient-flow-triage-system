-- =============================================================================
-- Migration V30: Add medical info columns to patient table
-- These columns support the patient medical profile features (blood type,
-- allergies, chronic conditions) used by the Doctor Portal and Patient EHR.
-- =============================================================================

ALTER TABLE patient ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS chronic_conditions TEXT;
