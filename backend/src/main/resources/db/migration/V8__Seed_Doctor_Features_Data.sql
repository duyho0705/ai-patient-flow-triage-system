-- Migration V8: Seed Specialized Data for Doctor Role Features
-- Focus: Charts, Risk Analysis Highlights, Prescription Management, and Appointments.

-- 1. Create a "CRITICAL" Patient for Risk Analysis Highlight
-- Account: patient_critical@gmail.com
INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, phone, is_active) VALUES 
('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001', 'patient_critical', 'patient_critical@gmail.com', '$2a$10$vI8qO.fXvTTHM2H7O5CDeO4bFpY5b9S9p7x.o6.N5Z.v1M5o7u7u.', 'Nguyễn Hoàng Nam', '0911222333', TRUE);

INSERT INTO patient (id, tenant_id, identity_user_id, full_name_vi, date_of_birth, gender, risk_level, chronic_conditions, assigned_doctor_id) VALUES 
('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0004-000000000001', 'Nguyễn Hoàng Nam', '1975-05-10', 'MALE', 'CRITICAL', 'Tiểu đường Type 2, Cao huyết áp', (SELECT id FROM doctor WHERE identity_user_id = (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1)));

-- 2. Add Critical Vital Signs for Nguyễn Hoàng Nam to trigger AI Alerts (Using patient_vital_log EAV)
INSERT INTO patient_vital_log (patient_id, vital_type, value_numeric, unit, recorded_at) VALUES 
('00000000-0000-0000-0004-000000000002', 'BP_SYSTOLIC', 170, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('00000000-0000-0000-0004-000000000002', 'BP_DIASTOLIC', 105, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('00000000-0000-0000-0004-000000000002', 'HEART_RATE', 95, 'bpm', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('00000000-0000-0000-0004-000000000002', 'GLUCOSE', 285.0, 'mg/dL', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('00000000-0000-0000-0004-000000000002', 'WEIGHT', 78.5, 'kg', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('00000000-0000-0000-0004-000000000002', 'BP_SYSTOLIC', 175, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('00000000-0000-0000-0004-000000000002', 'BP_DIASTOLIC', 110, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('00000000-0000-0000-0004-000000000002', 'HEART_RATE', 98, 'bpm', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('00000000-0000-0000-0004-000000000002', 'GLUCOSE', 290.0, 'mg/dL', CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- 3. Add 7-day Historical Data for "Nguyễn Văn A" to show Trends in Charts
INSERT INTO patient_vital_log (patient_id, vital_type, value_numeric, unit, recorded_at) VALUES 
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'BP_SYSTOLIC', 125, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '7 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'GLUCOSE', 110.0, 'mg/dL', CURRENT_TIMESTAMP - INTERVAL '7 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'BP_SYSTOLIC', 128, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '6 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'GLUCOSE', 115.0, 'mg/dL', CURRENT_TIMESTAMP - INTERVAL '6 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'BP_SYSTOLIC', 135, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '5 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'GLUCOSE', 140.0, 'mg/dL', CURRENT_TIMESTAMP - INTERVAL '5 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'BP_SYSTOLIC', 142, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '4 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'GLUCOSE', 165.0, 'mg/dL', CURRENT_TIMESTAMP - INTERVAL '4 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'BP_SYSTOLIC', 138, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '3 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'GLUCOSE', 155.0, 'mg/dL', CURRENT_TIMESTAMP - INTERVAL '3 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'BP_SYSTOLIC', 130, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '2 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'GLUCOSE', 125.0, 'mg/dL', CURRENT_TIMESTAMP - INTERVAL '2 days'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'BP_SYSTOLIC', 128, 'mmHg', CURRENT_TIMESTAMP - INTERVAL '1 day'),
((SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 'GLUCOSE', 118.0, 'mg/dL', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 4. Add Upcoming Appointments for Doctor's Schedule
INSERT INTO scheduling_appointment (id, tenant_id, branch_id, patient_id, doctor_user_id, appointment_date, slot_start_time, status, appointment_type, notes) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1), CURRENT_DATE, '14:00:00', 'SCHEDULED', 'RE_EXAMINATION', 'Tái khám định kỳ tiểu đường'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0004-000000000002', (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1), CURRENT_DATE + 1, '09:00:00', 'SCHEDULED', 'CONSULTATION', 'Khám do chỉ số bất thường');

-- 5. Add Past Prescriptions for History
INSERT INTO prescription (id, tenant_id, patient_id, doctor_id, diagnosis, notes, issued_at, expires_at) VALUES 
('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0002-000000000001', (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), (SELECT id FROM doctor WHERE identity_user_id = (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1)), 'Tiểu đường Type 2', 'Hạn chế tinh bột, tập thể dục 30p/ngày', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_DATE + 30);

INSERT INTO medication (id, prescription_id, medicine_name, dosage, frequency, duration_days, instructions) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0004-000000000003', 'Metformin 500mg', '1 viên', '2 lần/ngày', 30, 'Uống sau khi ăn'),
(uuid_generate_v4(), '00000000-0000-0000-0004-000000000003', 'Amlodipine 5mg', '1 viên', '1 lần/ngày', 30, 'Uống buổi sáng');
