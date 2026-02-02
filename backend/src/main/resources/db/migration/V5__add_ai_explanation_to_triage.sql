-- =============================================================================
-- Migration V5: Add missing columns identified during Hibernate validation
-- =============================================================================

-- Thêm cột ai_explanation cho triage_session
ALTER TABLE triage_session ADD COLUMN IF NOT EXISTS ai_explanation TEXT;

-- Ghi chú cho y tá nếu cần
COMMENT ON COLUMN triage_session.ai_explanation IS 'Giải thích từ AI về kết quả phân loại.';
