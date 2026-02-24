-- =============================================================================
-- Migration V22: Patient Chat Messages
-- =============================================================================

CREATE TABLE patient_chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES patient_chat_conversations(id) ON DELETE CASCADE,
    sender_type     VARCHAR(20) NOT NULL, -- PATIENT, DOCTOR
    content         TEXT NOT NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX ix_patient_chat_msg_conv ON patient_chat_messages(conversation_id);
CREATE INDEX ix_patient_chat_msg_sent_at ON patient_chat_messages(sent_at);
