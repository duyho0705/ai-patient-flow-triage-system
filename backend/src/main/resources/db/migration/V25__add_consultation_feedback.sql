-- =============================================================================
-- Migration V25: Add consultation_feedback table
-- =============================================================================

CREATE TABLE consultation_feedback (
    id UUID PRIMARY KEY,
    consultation_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    tenant_id UUID,
    CONSTRAINT fk_feedback_consultation FOREIGN KEY (consultation_id) REFERENCES clinical_consultation(id),
    CONSTRAINT fk_feedback_patient FOREIGN KEY (patient_id) REFERENCES patient(id)
);
