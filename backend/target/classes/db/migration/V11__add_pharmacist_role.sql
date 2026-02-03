-- =============================================================================
-- Migration V11: Thêm Role Dược sĩ (pharmacist)
-- =============================================================================

INSERT INTO identity_role (id, code, name_vi, description, created_at, updated_at)
VALUES (gen_random_uuid(), 'pharmacist', 'Dược sĩ', 'Quản lý kho thuốc, cấp phát thuốc theo đơn', now(), now())
ON CONFLICT (code) DO NOTHING;
