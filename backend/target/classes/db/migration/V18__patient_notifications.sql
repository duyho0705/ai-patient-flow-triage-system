-- =============================================================================
-- Migration V18: Patient Notifications
-- =============================================================================

CREATE TABLE patient_notifications (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    patient_id           UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    title                VARCHAR(255) NOT NULL,
    content              VARCHAR(1000) NOT NULL,
    type                 VARCHAR(64),
    related_resource_id  VARCHAR(255),
    is_read              BOOLEAN NOT NULL DEFAULT false,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_patient_notifications_patient_id ON patient_notifications(patient_id);
CREATE INDEX ix_patient_notifications_tenant_id ON patient_notifications(tenant_id);
CREATE INDEX ix_patient_notifications_created_at ON patient_notifications(created_at);
