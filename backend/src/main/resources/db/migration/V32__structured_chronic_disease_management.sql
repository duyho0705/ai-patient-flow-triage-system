-- =============================================================================
-- Migration V32: Structured Chronic Disease Management (CDM)
-- Enhances the system to handle long-term patient care and AI-driven monitoring.
-- =============================================================================

-- 1. Detailed Chronic Conditions (Instead of just a TEXT field)
CREATE TABLE patient_chronic_condition (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    condition_name      VARCHAR(255) NOT NULL, -- e.g., "Diabetes Type 2", "Hypertension"
    icd10_code          VARCHAR(20),           -- Medical standard code
    diagnosed_at        DATE,
    severity_level      VARCHAR(50),           -- STABLE, PROGRESSING, CRITICAL
    status              VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, REMISSION, INACTIVE
    clinical_notes      TEXT,
    tenant_id           UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Vital Thresholds/Targets (For Personalized AI Alerting)
-- AI will use these to determine if a patient is "out of range" based on their specific condition.
CREATE TABLE patient_vital_target (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    vital_type          VARCHAR(50) NOT NULL,  -- BLOOD_PRESSURE_SYSTOLIC, GLUCOSE, etc.
    min_value           DECIMAL(10,2),
    max_value           DECIMAL(10,2),
    target_value        DECIMAL(10,2),
    unit                VARCHAR(20),
    effective_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    notes               TEXT,
    tenant_id           UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Medication Adherence Tracking
ALTER TABLE patient_medication_reminder 
ADD COLUMN IF NOT EXISTS total_doses_taken INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_taken_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS adherence_score DECIMAL(5,2); -- Percentage of doses taken vs scheduled

-- Indices
CREATE INDEX ix_patient_chronic_patient ON patient_chronic_condition(patient_id);
CREATE INDEX ix_patient_vital_target_patient ON patient_vital_target(patient_id);
