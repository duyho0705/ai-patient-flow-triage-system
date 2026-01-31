-- =============================================================================
-- Migration 00003: Seed roles và user admin (dev/demo)
-- Chạy sau 00001, 00002. Tạo 5 role, 1 tenant mẫu, 1 branch, 1 user admin@example.com / password
-- =============================================================================

-- Roles (code trùng docs/roles-and-features: admin, receptionist, triage_nurse, doctor, clinic_manager)
INSERT INTO identity_role (id, code, name_vi, description, created_at, updated_at) VALUES
    (gen_random_uuid(), 'admin', 'Quản trị hệ thống', 'Quản lý tenant, user, cấu hình, AI audit', now(), now()),
    (gen_random_uuid(), 'receptionist', 'Lễ tân', 'Tiếp nhận bệnh nhân, đặt lịch, check-in', now(), now()),
    (gen_random_uuid(), 'triage_nurse', 'Y tá phân loại', 'Phân loại bệnh nhân, sinh hiệu, AI triage', now(), now()),
    (gen_random_uuid(), 'doctor', 'Bác sĩ', 'Khám bệnh, xem hàng chờ theo ưu tiên', now(), now()),
    (gen_random_uuid(), 'clinic_manager', 'Quản lý vận hành', 'Báo cáo, thời gian chờ, hiệu quả', now(), now())
ON CONFLICT (code) DO NOTHING;

-- Tenant mẫu (nếu chưa có)
INSERT INTO tenant (id, code, name_vi, locale, timezone, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'CLINIC_DEMO', 'Phòng khám Demo', 'vi-VN', 'Asia/Ho_Chi_Minh', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM tenant WHERE code = 'CLINIC_DEMO');

-- Branch mẫu cho tenant vừa tạo
INSERT INTO tenant_branch (id, tenant_id, code, name_vi, is_active, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'CN01', 'Chi nhánh 1', true, now(), now()
FROM tenant t WHERE t.code = 'CLINIC_DEMO'
AND NOT EXISTS (SELECT 1 FROM tenant_branch tb WHERE tb.tenant_id = t.id AND tb.code = 'CN01');

-- User admin (password = "password", BCrypt cost 10)
-- Hash cho "password": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO identity_user (id, email, password_hash, full_name_vi, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'admin@example.com',
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
       'Admin Demo', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM identity_user WHERE email = 'admin@example.com');

-- Gán role admin cho user admin@example.com tại tenant CLINIC_DEMO (branch_id NULL = toàn tenant)
INSERT INTO identity_user_role (id, user_id, role_id, tenant_id, branch_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, t.id, NULL, now()
FROM identity_user u
CROSS JOIN identity_role r
CROSS JOIN tenant t
WHERE u.email = 'admin@example.com' AND r.code = 'admin' AND t.code = 'CLINIC_DEMO'
AND NOT EXISTS (
    SELECT 1 FROM identity_user_role iur
    WHERE iur.user_id = u.id AND iur.role_id = r.id AND iur.tenant_id = t.id AND iur.branch_id IS NULL
);
