-- Migration V3: Add read_at column to patient_chat_messages
ALTER TABLE patient_chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
