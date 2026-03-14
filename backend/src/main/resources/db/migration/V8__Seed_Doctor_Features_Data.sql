-- Migration V8: Seed Specialized Data for Doctor Role Features
-- Focus: Charts, Risk Analysis Highlights, Prescription Management, and Appointments.

-- 1. Create a "CRITICAL" Patient for Risk Analysis Highlight
-- Account: patient_critical@gmail.com
INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, phone, is_active) VALUES 
('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001', 'patient_critical', 'patient_critical@gmail.com', '$2a$10$vI8qO.fXvTTHM2H7O5CDeO4bFpY5b9S9p7x.o6.N5Z.v1M5o7u7u.', 'Nguyễn Hoàng Nam', '0911222333', TRUE);

INSERT INTO patient (id, tenant_id, identity_user_id, full_name_vi, date_of_birth, gender, risk_level, chronic_conditions, assigned_doctor_id) VALUES 
('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0004-000000000001', 'Nguyễn Hoàng Nam', '1975-05-10', 'MALE', 'CRITICAL', 'Tiểu đường Type 2, Cao huyết áp', (SELECT id FROM doctor WHERE identity_user_id = (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1)));

-- 2. Add Critical Vital Signs for Nguyễn Hoàng Nam to trigger AI Alerts
INSERT INTO patient_vital_signs (id, patient_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, blood_glucose, weight, measured_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0004-000000000002', 170, 105, 95, 285.0, 78.5, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(uuid_generate_v4(), '00000000-0000-0000-0004-000000000002', 175, 110, 98, 290.0, 78.5, CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- 3. Add 7-day Historical Data for "Nguyễn Văn A" to show Trends in Charts
-- We insert a series of records with varying dates
INSERT INTO patient_vital_signs (id, patient_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, blood_glucose, measured_at) VALUES 
(uuid_generate_v4(), (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 125, 82, 72, 110.0, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(uuid_generate_v4(), (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 128, 85, 75, 115.0, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(uuid_generate_v4(), (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 135, 88, 78, 140.0, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(uuid_generate_v4(), (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 142, 92, 80, 165.0, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(uuid_generate_v4(), (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 138, 90, 78, 155.0, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(uuid_generate_v4(), (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 130, 85, 74, 125.0, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(uuid_generate_v4(), (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), 128, 84, 72, 118.0, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 4. Add Upcoming Appointments for Doctor's Schedule
INSERT INTO appointment (id, tenant_id, branch_id, patient_id, doctor_user_id, scheduled_at, status, type, notes) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1), CURRENT_TIMESTAMP + INTERVAL '2 hours', 'SCHEDULED', 'RE-EXAMINATION', 'Tái khám định kỳ tiểu đường'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0004-000000000002', (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1), CURRENT_TIMESTAMP + INTERVAL '1 day', 'SCHEDULED', 'CONSULTATION', 'Khám do chỉ số bất thường');

-- 5. Add Past Prescriptions for History
INSERT INTO clinical_prescription (id, tenant_id, patient_id, doctor_id, diagnosis, advice, created_at, follow_up_date) VALUES 
('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0002-000000000001', (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1), (SELECT id FROM doctor WHERE identity_user_id = (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1)), 'Tiểu đường Type 2', 'Hạn chế tinh bột, tập thể dục 30p/ngày', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_DATE + 30);

INSERT INTO clinical_prescription_item (id, prescription_id, medication_name, dosage, frequency, duration, instructions) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0004-000000000003', 'Metformin 500mg', '1 viên', '2 lần/ngày', '30 ngày', 'Uống sau khi ăn'),
(uuid_generate_v4(), '00000000-0000-0000-0004-000000000003', 'Amlodipine 5mg', '1 viên', '1 lần/ngày', '30 ngày', 'Uống buổi sáng');
