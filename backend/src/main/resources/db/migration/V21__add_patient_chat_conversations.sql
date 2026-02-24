-- =============================================================================
-- Migration V21: Patient Chat Conversations
-- =============================================================================

CREATE TABLE patient_chat_conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    doctor_user_id  UUID NOT NULL REFERENCES identity_user(id) ON DELETE CASCADE,
    status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX ix_patient_chat_conv_patient ON patient_chat_conversations(patient_id);
CREATE INDEX ix_patient_chat_conv_doctor ON patient_chat_conversations(doctor_user_id);
