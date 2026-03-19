-- Migration V9: Seed Data for Clinic Manager Role (Role 3)
-- Focus: Performance Reports, Missed Follow-ups, and Disease Distribution Trends.

-- 1. Add "Missed Follow-up" Patients
-- These patients exist but haven't had any consultations in the last 45 days.
INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, phone, is_active) VALUES 
('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0002-000000000001', 'missed_patient_1', 'missed1@gmail.com', '$2a$10$vI8qO.fXvTTHM2H7O5CDeO4bFpY5b9S9p7x.o6.N5Z.v1M5o7u7u.', 'Trần Văn Lỡ', '0944000111', TRUE);

INSERT INTO patient (id, tenant_id, identity_user_id, full_name_vi, date_of_birth, gender, risk_level, chronic_conditions, assigned_doctor_id) VALUES 
('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0005-000000000001', 'Trần Văn Lỡ', '1965-08-20', 'MALE', 'MEDIUM', 'Tăng huyết áp', (SELECT id FROM doctor WHERE identity_user_id = (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1)));

-- No consultations for "Trần Văn Lỡ" in clinical_consultation table yet.

-- 2. Add historical Consultations for BS. Trần Thị Thu Thủy (doctor02@gmail.com) 
-- This will populate the "Doctor Performance" chart for comparison
INSERT INTO clinical_consultation (id, tenant_id, branch_id, patient_id, doctor_user_id, status, chief_complaint_summary, diagnosis_notes, started_at, ended_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), (SELECT id FROM identity_user WHERE email='doctor02@gmail.com' LIMIT 1), 'COMPLETED', 'Tư vấn dinh dưỡng', 'Khám tổng quát', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '30 minutes'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', (SELECT id FROM patient WHERE full_name_vi = 'Trần Văn Lỡ' LIMIT 1), (SELECT id FROM identity_user WHERE email='doctor02@gmail.com' LIMIT 1), 'COMPLETED', 'Đau khớp', 'Thoái hóa khớp', CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP - INTERVAL '60 days' + INTERVAL '25 minutes');

-- 3. Add more diverse chronic conditions for "Disease Distribution" report
INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, phone, is_active) VALUES 
('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0002-000000000001', 'disease_test_1', 'disease1@gmail.com', '$2a$10$vI8qO.fXvTTHM2H7O5CDeO4bFpY5b9S9p7x.o6.N5Z.v1M5o7u7u.', 'Lê Hoàng B', '0955666777', TRUE);

INSERT INTO patient (id, tenant_id, identity_user_id, full_name_vi, date_of_birth, gender, risk_level, chronic_conditions, assigned_doctor_id) VALUES 
('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0005-000000000003', 'Lê Hoàng B', '1985-03-12', 'MALE', 'LOW', 'COPD', (SELECT id FROM doctor WHERE identity_user_id = (SELECT id FROM identity_user WHERE email = 'doctor02@gmail.com' LIMIT 1)));

-- 4. Add data for Monthly Report historical comparison (Last Month)
-- We simulate consultations in the previous month
INSERT INTO clinical_consultation (id, tenant_id, branch_id, patient_id, doctor_user_id, status, chief_complaint_summary, diagnosis_notes, started_at, ended_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), (SELECT id FROM identity_user WHERE email='doctor@gmail.com' LIMIT 1), 'COMPLETED', 'Tái khám', 'Tiểu đường', CURRENT_TIMESTAMP - INTERVAL '35 days', CURRENT_TIMESTAMP - INTERVAL '35 days' + INTERVAL '15 minutes'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', (SELECT id FROM patient WHERE full_name_vi = 'Lê Hoàng B' LIMIT 1), (SELECT id FROM identity_user WHERE email='doctor02@gmail.com' LIMIT 1), 'COMPLETED', 'Khám đầu', 'Viêm phế quản', CURRENT_TIMESTAMP - INTERVAL '40 days', CURRENT_TIMESTAMP - INTERVAL '40 days' + INTERVAL '20 minutes');
