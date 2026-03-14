-- Migration V10: Seed Data for Patient Role Features
-- Focus: Medication Adherence, Health Tracking, and Notifications.

-- 1. Add Medication Schedule for today (For "Nhắc giờ uống thuốc" and "Đánh dấu Đã uống")
-- Primary patient: Nguyễn Văn A (ID from V5: 00000000-0000-0000-0002-000000000008)
INSERT INTO medication_schedule (id, patient_id, medication_id, medication_name, scheduled_time, status, notes) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', uuid_generate_v4(), 'Metformin 500mg', CURRENT_DATE + TIME '08:00:00', 'PENDING', 'Uống sau khi ăn sáng'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', uuid_generate_v4(), 'Amlodipine 5mg', CURRENT_DATE + TIME '08:00:00', 'TAKEN', 'Uống buổi sáng'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', uuid_generate_v4(), 'Metformin 500mg', CURRENT_DATE + TIME '20:00:00', 'PENDING', 'Uống sau khi ăn tối');

-- 2. Add some "Missed" medication from yesterday to trigger warnings
INSERT INTO medication_schedule (id, patient_id, medication_id, medication_name, scheduled_time, status, notes) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', uuid_generate_v4(), 'Metformin 500mg', CURRENT_DATE - INTERVAL '1 day' + TIME '20:00:00', 'MISSED', 'Bệnh nhân quên uống');

-- 3. Add unread User Notifications (For the bell icon)
INSERT INTO user_notification (id, user_id, title, content, type, is_read, created_at) VALUES 
(uuid_generate_v4(), (SELECT identity_user_id FROM patient WHERE id = '00000000-0000-0000-0002-000000000008'), 'Lịch tái khám sắp tới', 'Bạn có lịch hẹn tái khám với BS. Lê Mạnh Hùng vào lúc 10:00 ngày mai.', 'APPOINTMENT', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(uuid_generate_v4(), (SELECT identity_user_id FROM patient WHERE id = '00000000-0000-0000-0002-000000000008'), 'Cảnh báo chỉ số sức khỏe', 'Chỉ số đường huyết của bạn sáng nay hơi cao (165 mg/dL). Hãy chú ý chế độ ăn uống.', 'HEALTH_ALERT', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 hours');

-- 4. Add more granular Vital Signs for "Xem biểu đồ theo ngày/tuần"
-- Today's readings
INSERT INTO patient_vital_signs (id, patient_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, blood_glucose, measured_at, note) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', 122, 80, 70, 105.0, CURRENT_DATE + TIME '06:30:00', 'Đo lúc mới ngủ dậy'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', 135, 85, 75, 145.0, CURRENT_DATE + TIME '11:30:00', 'Sau khi ăn sáng 2 tiếng');

-- 5. Add SpO2 and Weight (as requested in rules)
UPDATE patient SET weight = 72.5, height = 170.0 WHERE id = '00000000-0000-0000-0002-000000000008';
INSERT INTO patient_vital_signs (id, patient_id, spo2, weight, measured_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000008', 98, 72.5, CURRENT_TIMESTAMP - INTERVAL '12 hours');
