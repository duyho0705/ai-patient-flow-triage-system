-- Migration V5: Seed Enterprise Demo Data for Testing
-- 1. Create a Medical Tenant and Branch
INSERT INTO tenant (id, code, name_vi, tax_code) VALUES 
('00000000-0000-0000-0002-000000000001', 'CLINIC_01', 'Phòng khám Đa khoa Quốc tế CDM', '123456789');

INSERT INTO tenant_branch (id, tenant_id, code, name_vi, city, district) VALUES 
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0002-000000000001', 'BRANCH_D1', 'Chi nhánh Quận 1', 'Hồ Chí Minh', 'Quận 1');

-- 2. Create a Doctor User and Profile
-- Password: 'password' (bcrypt hash)
INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, phone, is_active) VALUES 
('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0002-000000000001', 'doctor01', 'hung.le@vnclinic.cdm', '$2a$10$vI8qO.fXvTTHM2H7O5CDeO4bFpY5b9S9p7x.o6.N5Z.v1M5o7u7u.', 'BS. Lê Mạnh Hùng', '0901234567', TRUE);

INSERT INTO identity_user_role (id, user_id, role_id, tenant_id, branch_id) VALUES 
('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002');

INSERT INTO doctor (id, tenant_id, identity_user_id, specialty, license_number, bio) VALUES 
('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000003', 'Nội tổng quát', 'LICENSE-001', 'Bác sĩ chuyên khoa nội với 10 năm kinh nghiệm điều trị bệnh mãn tính.');

-- 3. Create a Patient User and Profile
INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, phone, is_active) VALUES 
('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0002-000000000001', 'patient01', 'nguyen.vana@gmail.com', '$2a$10$vI8qO.fXvTTHM2H7O5CDeO4bFpY5b9S9p7x.o6.N5Z.v1M5o7u7u.', 'Nguyễn Văn A', '0911223344', TRUE);

INSERT INTO identity_user_role (id, user_id, role_id, tenant_id, branch_id) VALUES 
('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002');

INSERT INTO patient (id, tenant_id, identity_user_id, full_name_vi, date_of_birth, gender, blood_type, risk_level, assigned_doctor_id, chronic_conditions) VALUES 
('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000006', 'Nguyễn Văn A', '1975-05-20', 'MALE', 'O+', 'HIGH', '00000000-0000-0000-0002-000000000005', 'Tiểu đường Type 2, Cao huyết áp');

-- 4. Seed Health Metrics (Vitals) to trigger "Risk Analysis"
-- Normal metric
INSERT INTO health_metric (id, patient_id, tenant_id, metric_type, value, unit, status, recorded_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0002-000000000001', 'BLOOD_GLUCOSE', 110.0, 'mg/dL', 'NORMAL', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Abnormal metric (High Glucose)
INSERT INTO health_metric (id, patient_id, tenant_id, metric_type, value, unit, status, recorded_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0002-000000000001', 'BLOOD_GLUCOSE', 210.0, 'mg/dL', 'CRITICAL', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Abnormal metric (High Blood Pressure)
INSERT INTO health_metric (id, patient_id, tenant_id, metric_type, value, unit, status, recorded_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0002-000000000001', 'BLOOD_PRESSURE_SYSTOLIC', 165.0, 'mmHg', 'WARNING', CURRENT_TIMESTAMP);

-- 5. Seed Chat Data
INSERT INTO patient_chat_conversations (id, patient_id, doctor_user_id, status) VALUES 
('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0002-000000000003', 'ACTIVE');

INSERT INTO patient_chat_messages (id, conversation_id, sender_type, content, sent_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000009', 'PATIENT', 'Chào bác sĩ, hôm nay tôi thấy hơi chóng mặt, đường huyết đo được là 210.', CURRENT_TIMESTAMP - INTERVAL '1 hour');

INSERT INTO patient_chat_messages (id, conversation_id, sender_type, content, sent_at, read_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000009', 'DOCTOR', 'Chào anh A, chỉ số này đang hơi cao. Anh hãy nghỉ ngơi và uống thuốc theo đơn nhé. Tôi sẽ theo dõi thêm.', CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '5 minutes');

-- 6. Seed a Prescription
INSERT INTO prescription (id, patient_id, tenant_id, doctor_id, diagnosis, status, issued_at) VALUES 
('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000005', 'Tiểu đường Type 2 kiểm soát kém', 'ISSUED', CURRENT_TIMESTAMP);

INSERT INTO medication (id, prescription_id, medicine_name, dosage, quantity, frequency, duration_days) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000010', 'Metformin 500mg', '1 viên', 30, 'Sáng 1 - Chiều 1', 15);
