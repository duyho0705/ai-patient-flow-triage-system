-- =============================================================================
-- Migration V34: Patient Self-Management (Vital Logging & Medication Tracking)
-- =============================================================================

-- 1. Patient Manual Vital Logging
CREATE TABLE patient_vital_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    vital_type      VARCHAR(32) NOT NULL, -- BLOOD_GLUCOSE, BLOOD_PRESSURE, HEART_RATE, WEIGHT, SPO2
    value_numeric   NUMERIC(10,2) NOT NULL,
    unit            VARCHAR(20),
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    image_url       VARCHAR(512), -- Photo of the medical meter
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_patient_vital_log_patient_id ON patient_vital_log(patient_id);
CREATE INDEX ix_patient_vital_log_recorded_at ON patient_vital_log(recorded_at);

-- 2. Medication Intake Logging
CREATE TABLE medication_dosage_log (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id             UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    medication_reminder_id UUID REFERENCES patient_medication_reminder(id) ON DELETE SET NULL,
    medicine_name          VARCHAR(255) NOT NULL,
    dosage_instruction     VARCHAR(500),
    taken_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_medication_dosage_log_patient_id ON medication_dosage_log(patient_id);
CREATE INDEX ix_medication_dosage_log_taken_at ON medication_dosage_log(taken_at);

-- 3. Update Patient Dashboard DTO logic will be handled in Java
