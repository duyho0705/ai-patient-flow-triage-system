-- =============================================================================
-- Migration V24: Add average_consultation_minutes to queue_definition
-- =============================================================================

ALTER TABLE queue_definition 
ADD COLUMN average_consultation_minutes INTEGER DEFAULT 15;
