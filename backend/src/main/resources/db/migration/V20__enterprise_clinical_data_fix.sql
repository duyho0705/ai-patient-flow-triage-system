-- =============================================================================
-- Migration V20: Diagnostic Images, Lab Results & Patient Relatives
-- =============================================================================

CREATE TABLE diagnostic_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES clinical_consultation(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    image_url       VARCHAR(1000),
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lab_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES clinical_consultation(id) ON DELETE CASCADE,
    test_name       VARCHAR(255) NOT NULL,
    value           VARCHAR(255),
    unit            VARCHAR(255),
    reference_range VARCHAR(255),
    status          VARCHAR(50), -- NORMAL, HIGH, LOW
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE patient_relative (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    full_name       VARCHAR(255) NOT NULL,
    relationship    VARCHAR(255) NOT NULL,
    phone_number    VARCHAR(20),
    gender          VARCHAR(20),
    age             INT,
    avatar_url      VARCHAR(1000),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX ix_diagnostic_images_consultation ON diagnostic_images(consultation_id);
CREATE INDEX ix_lab_results_consultation ON lab_results(consultation_id);
CREATE INDEX ix_patient_relative_patient ON patient_relative(patient_id);

-- Triggers for updated_at
CREATE TRIGGER tr_diagnostic_images_updated_at BEFORE UPDATE ON diagnostic_images FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_lab_results_updated_at BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_patient_relative_updated_at BEFORE UPDATE ON patient_relative FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
