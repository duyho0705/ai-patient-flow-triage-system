-- Migration V11: Update Patient Flow Configuration
-- Goal: Disable self-registration at system level (meta) and ensure doctors have necessary permissions.

-- 1. Add System Configuration for Registration Control
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('auth_allow_self_registration', 'false', 'Flag to enable/disable public patient registration');

-- 2. Add Permission for Patient Creation (Staff-led)
INSERT INTO identity_permission (id, code, name, description) VALUES 
('00000000-0000-0000-0000-000000000101', 'PATIENT_CREATE', 'Tạo tài khoản bệnh nhân', 'Cho phép bác sĩ/quản lý tạo hồ sơ bệnh nhân mới');

-- 3. Assign Permission to DOCTOR, CLINIC_MANAGER, and SYSTEM_ADMIN roles
INSERT INTO identity_role_permission (id, role_id, permission_id) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000101'), -- DOCTOR
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000101'), -- CLINIC_MANAGER
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000101'); -- SYSTEM_ADMIN

-- 4. Update existing doctor accounts for better testing
-- Ensuring BS. Lê Mạnh Hùng (hung.le@vnclinic.cdm) and the default doctor@gmail.com have a consistent experience
UPDATE identity_user SET full_name_vi = 'BS. Lê Mạnh Hùng' WHERE email = 'hung.le@vnclinic.cdm';
UPDATE identity_user SET full_name_vi = 'Bác sĩ CDM' WHERE email = 'doctor@gmail.com';
