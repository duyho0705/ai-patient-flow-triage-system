-- Migration V6: Assign Patient to Bác sĩ Tú for E2E Testing
-- 1. Find the Doctor ID for "doctor@gmail.com" (Bác sĩ Tú)
UPDATE patient 
SET assigned_doctor_id = (
    SELECT id FROM doctor 
    WHERE identity_user_id = (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1) 
    LIMIT 1
)
WHERE full_name_vi = 'Nguyễn Văn A';

-- 2. Create a chat conversation for Bác sĩ Tú and Nguyễn Văn A
INSERT INTO patient_chat_conversations (id, patient_id, doctor_user_id, status)
SELECT 
    uuid_generate_v4(), 
    (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1),
    (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1),
    'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM patient_chat_conversations 
    WHERE patient_id = (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1)
    AND doctor_user_id = (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1)
);

-- 3. Add a welcome message from the patient
INSERT INTO patient_chat_messages (id, conversation_id, sender_type, content, sent_at)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM patient_chat_conversations 
     WHERE patient_id = (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1)
     AND doctor_user_id = (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1)
     LIMIT 1),
    'PATIENT',
    'Chào Bác sĩ Tú, tôi cần tư vấn về chỉ số đường huyết sáng nay.',
    CURRENT_TIMESTAMP - INTERVAL '10 minutes'
WHERE EXISTS (
    SELECT 1 FROM patient_chat_conversations 
    WHERE patient_id = (SELECT id FROM patient WHERE full_name_vi = 'Nguyễn Văn A' LIMIT 1)
    AND doctor_user_id = (SELECT id FROM identity_user WHERE email = 'doctor@gmail.com' LIMIT 1)
);
