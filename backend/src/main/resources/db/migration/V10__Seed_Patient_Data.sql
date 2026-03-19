-- Migration V10: Seed Data for Patient Role Features
-- Focus: Medication Adherence, Health Tracking, and Notifications.

-- 1. Add Medication Schedule for today (For "Nhắc giờ uống thuốc" and "Đánh dấu Đã uống")
-- Primary patient: Nguyễn Văn A (ID from V5: 00000000-0000-0000-0002-000000000008)
-- We need to find the medication_id first.
INSERT INTO medication_schedule (id, medication_id, scheduled_time, status, notes) VALUES 
(uuid_generate_v4(), (SELECT id FROM medication WHERE medicine_name = 'Metformin 500mg' LIMIT 1), CURRENT_DATE + TIME '08:00:00', 'PENDING', 'Uống sau khi ăn sáng'),
(uuid_generate_v4(), (SELECT id FROM medication WHERE medicine_name = 'Metformin 500mg' LIMIT 1), CURRENT_DATE + TIME '20:00:00', 'PENDING', 'Uống sau khi ăn tối');

-- 2. Add unread User Notifications (For the bell icon)
INSERT INTO patient_notifications (id, tenant_id, patient_id, title, content, type, is_read, created_at) VALUES 
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000008', 'Lịch tái khám sắp tới', 'Bạn có lịch hẹn tái khám với BS. Lê Mạnh Hùng vào lúc 10:00 ngày mai.', 'APPOINTMENT', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(uuid_generate_v4(), '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000008', 'Cảnh báo chỉ số sức khỏe', 'Chỉ số đường huyết của bạn sáng nay hơi cao (165 mg/dL). Hãy chú ý chế độ ăn uống.', 'HEALTH_ALERT', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 hours');

-- 3. Add more granular Vital Signs for "Xem biểu đồ theo ngày/tuần" (Using patient_vital_log EAV)
INSERT INTO patient_vital_log (patient_id, vital_type, value_numeric, unit, recorded_at, notes) VALUES 
('00000000-0000-0000-0002-000000000008', 'BP_SYSTOLIC', 122, 'mmHg', CURRENT_DATE + TIME '06:30:00', 'Đo lúc mới ngủ dậy'),
('00000000-0000-0000-0002-000000000008', 'BP_DIASTOLIC', 80, 'mmHg', CURRENT_DATE + TIME '06:30:00', 'Đo lúc mới ngủ dậy'),
('00000000-0000-0000-0002-000000000008', 'GLUCOSE', 105.0, 'mg/dL', CURRENT_DATE + TIME '06:30:00', 'Đo lúc mới ngủ dậy'),
('00000000-0000-0000-0002-000000000008', 'BP_SYSTOLIC', 135, 'mmHg', CURRENT_DATE + TIME '11:30:00', 'Sau khi ăn sáng 2 tiếng'),
('00000000-0000-0000-0002-000000000008', 'BP_DIASTOLIC', 85, 'mmHg', CURRENT_DATE + TIME '11:30:00', 'Sau khi ăn sáng 2 tiếng'),
('00000000-0000-0000-0002-000000000008', 'GLUCOSE', 145.0, 'mg/dL', CURRENT_DATE + TIME '11:30:00', 'Sau khi ăn sáng 2 tiếng'),
('00000000-0000-0000-0002-000000000008', 'SPO2', 98, '%', CURRENT_TIMESTAMP - INTERVAL '12 hours', NULL),
('00000000-0000-0000-0002-000000000008', 'WEIGHT', 72.5, 'kg', CURRENT_TIMESTAMP - INTERVAL '12 hours', NULL);
