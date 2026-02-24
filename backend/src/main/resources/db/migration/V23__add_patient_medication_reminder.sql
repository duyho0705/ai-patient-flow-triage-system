-- =============================================================================
-- Migration V23: Patient Medication Reminder
-- =============================================================================

CREATE TABLE patient_medication_reminder (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    prescription_item_id UUID REFERENCES clinical_prescription_item(id) ON DELETE SET NULL,
    medicine_name       VARCHAR(255) NOT NULL,
    reminder_time       TIME NOT NULL,
    dosage              VARCHAR(100),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    tenant_id           UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100)
);

-- Indices
CREATE INDEX ix_med_reminder_patient ON patient_medication_reminder(patient_id);
CREATE INDEX ix_med_reminder_tenant ON patient_medication_reminder(tenant_id);
