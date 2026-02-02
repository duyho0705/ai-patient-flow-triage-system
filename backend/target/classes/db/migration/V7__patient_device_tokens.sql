-- =============================================================================
-- Migration V7: Create patient_device_token table for FCM
-- =============================================================================

CREATE TABLE patient_device_token (
    id             UUID PRIMARY KEY,
    patient_id     UUID NOT NULL,
    fcm_token      VARCHAR(500) NOT NULL,
    device_type    VARCHAR(32),
    last_seen_at   TIMESTAMP WITH TIME ZONE,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by     VARCHAR(255),
    updated_by     VARCHAR(255),
    version        BIGINT NOT NULL DEFAULT 0,
    
    CONSTRAINT fk_pdt_patient FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE
);

CREATE INDEX ix_pdt_patient_id ON patient_device_token(patient_id);
CREATE UNIQUE INDEX ux_pdt_fcm_token ON patient_device_token(fcm_token);
