-- Thêm cột ghi lý do override khi y tá không chấp nhận gợi ý AI (Enterprise / Explainability)
ALTER TABLE triage_session ADD COLUMN IF NOT EXISTS override_reason TEXT;
COMMENT ON COLUMN triage_session.override_reason IS 'Lý do override khi không chấp nhận gợi ý AI.';
