-- =============================================================================
-- Migration V26: Add doctor_user_id to scheduling_appointment
-- =============================================================================

ALTER TABLE scheduling_appointment 
ADD COLUMN doctor_user_id UUID REFERENCES identity_user(id) ON DELETE SET NULL;

CREATE INDEX ix_scheduling_appointment_doctor_user_id ON scheduling_appointment(doctor_user_id);
