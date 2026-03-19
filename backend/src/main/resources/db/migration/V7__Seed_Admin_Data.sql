-- Migration V7: Seed Admin & Clinic Manager Demo Data
-- This script adds more entities to test Dashboards, Doctor Management, Allocation, and Reports.

-- 1. Add more Doctors
-- Account: doctor02@gmail.com / Denyeubama1
INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, phone, is_active) VALUES 
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', 'doctor02', 'doctor02@gmail.com', '$2a$10$vI8qO.fXvTTHM2H7O5CDeO4bFpY5b9S9p7x.o6.N5Z.v1M5o7u7u.', 'BS. Trần Thị Thu Thủy', '0902223344', TRUE);

INSERT INTO identity_user_role (id, user_id, role_id, tenant_id, branch_id) VALUES 
('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002');

INSERT INTO doctor (id, tenant_id, identity_user_id, specialty, license_number, bio) VALUES 
('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', 'Khoa Tim Mạch', 'LICENSE-002', 'Chuyên gia tim mạch hàng đầu.');

-- 2. Add Unassigned Patients (For Allocation Feature)
INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, phone, is_active) VALUES 
('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000001', 'patient_unassigned_1', 'unassigned1@gmail.com', '$2a$10$vI8qO.fXvTTHM2H7O5CDeO4bFpY5b9S9p7x.o6.N5Z.v1M5o7u7u.', 'Lê Văn C', '0933112233', TRUE);

INSERT INTO patient (id, tenant_id, identity_user_id, full_name_vi, date_of_birth, gender, risk_level, chronic_conditions, assigned_doctor_id) VALUES 
('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000004', 'Lê Văn C', '1980-01-15', 'MALE', 'LOW', 'Rối loạn mỡ máu', NULL);

INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, phone, is_active) VALUES 
('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000001', 'patient_unassigned_2', 'unassigned2@gmail.com', '$2a$10$vI8qO.fXvTTHM2H7O5CDeO4bFpY5b9S9p7x.o6.N5Z.v1M5o7u7u.', 'Phạm Thị D', '0933445566', TRUE);

INSERT INTO patient (id, tenant_id, identity_user_id, full_name_vi, date_of_birth, gender, risk_level, chronic_conditions, assigned_doctor_id) VALUES 
('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000006', 'Phạm Thị D', '1992-11-20', 'FEMALE', 'MEDIUM', 'Hen suyễn', NULL);

-- 3. Add System Settings (For Configuration Feature)
INSERT INTO system_settings (id, setting_key, setting_value, category, description) VALUES 
(uuid_generate_v4(), 'GLUCOSE_HIGH_THRESHOLD', '180', 'THRESHOLD', 'Ngưỡng đường huyết cao cảnh báo'),
(uuid_generate_v4(), 'BP_SYSTOLIC_HIGH_THRESHOLD', '140', 'THRESHOLD', 'Ngưỡng huyết áp tâm thu cao'),
(uuid_generate_v4(), 'AI_RISK_RESCAN_INTERVAL_HOURS', '6', 'AI_CONFIG', 'Khoảng thời gian quét lại rủi ro AI');

-- 4. Add Audit Logs (For Audit Feature)
INSERT INTO audit_log (id, tenant_id, user_id, email, entity_name, entity_id, action, details, ip_address, created_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', (SELECT id FROM identity_user WHERE username='admin' LIMIT 1), 'admin@cdm.com', 'PATIENT', '00000000-0000-0000-0002-000000000008', 'UPDATE', 'Cập nhật tình trạng bệnh mãn tính', '127.0.0.1', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', (SELECT id FROM identity_user WHERE username='admin' LIMIT 1), 'admin@cdm.com', 'DOCTOR', '00000000-0000-0000-0002-000000000005', 'CREATE', 'Thêm mới bác sĩ Lê Mạnh Hùng', '127.0.0.1', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 5. Add some mock data for performance reports
-- Let's say Dr. Tú (doctor@gmail.com) has handled some consultations
INSERT INTO clinical_consultation (id, tenant_id, branch_id, patient_id, doctor_user_id, status, chief_complaint_summary, diagnosis_notes, started_at, ended_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0002-000000000008', (SELECT id FROM identity_user WHERE email='doctor@gmail.com'), 'COMPLETED', 'Đau đầu, mệt mỏi', 'Cơn tăng huyết áp kịch phát', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '20 minutes'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0002-000000000008', (SELECT id FROM identity_user WHERE email='doctor@gmail.com'), 'COMPLETED', 'Kiểm tra định kỳ', 'Tiểu đường type 2 ổn định', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '15 minutes');
