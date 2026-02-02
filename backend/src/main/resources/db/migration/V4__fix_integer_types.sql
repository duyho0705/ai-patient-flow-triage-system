-- =============================================================================
-- Migration V4: Fix type mismatches (SMALLINT -> INTEGER)
-- Hibernate validation expects INTEGER (int4) for java.lang.Integer
-- =============================================================================

ALTER TABLE scheduling_slot_template ALTER COLUMN duration_minutes TYPE INTEGER;
ALTER TABLE triage_complaint ALTER COLUMN display_order TYPE INTEGER;
ALTER TABLE queue_definition ALTER COLUMN display_order TYPE INTEGER;
