-- Migration V31: Demo Patient Journey Seed Data
-- =============================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_role_doctor UUID;
    v_role_nurse UUID;
    v_role_receptionist UUID;
    
    v_user_doctor UUID := gen_random_uuid();
    v_user_nurse UUID := gen_random_uuid();
    v_user_reception UUID := gen_random_uuid();
    
    v_patient_1 UUID := gen_random_uuid();
    v_patient_2 UUID := gen_random_uuid();
    v_patient_3 UUID := gen_random_uuid();
    
    v_queue_id UUID;
    v_password_hash TEXT := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'; -- "password"
BEGIN
    -- 1. Get IDs
    SELECT id INTO v_tenant_id FROM tenant WHERE code = 'CLINIC_DEMO' LIMIT 1;
    SELECT id INTO v_branch_id FROM tenant_branch WHERE code = 'CN01' AND tenant_id = v_tenant_id LIMIT 1;
    
    SELECT id INTO v_role_doctor FROM identity_role WHERE code = 'doctor' LIMIT 1;
    SELECT id INTO v_role_nurse FROM identity_role WHERE code = 'triage_nurse' LIMIT 1;
    SELECT id INTO v_role_receptionist FROM identity_role WHERE code = 'receptionist' LIMIT 1;

    -- 2. Staff Users
    INSERT INTO identity_user (id, email, password_hash, full_name_vi, is_active, created_at, updated_at)
    SELECT v_user_doctor, 'doctor@example.com', v_password_hash, 'BS. Nguyễn Văn Tuyến', true, now(), now()
    WHERE NOT EXISTS (SELECT 1 FROM identity_user WHERE email = 'doctor@example.com');

    INSERT INTO identity_user (id, email, password_hash, full_name_vi, is_active, created_at, updated_at)
    SELECT v_user_nurse, 'nurse@example.com', v_password_hash, 'Y tá Lê Thị Mai', true, now(), now()
    WHERE NOT EXISTS (SELECT 1 FROM identity_user WHERE email = 'nurse@example.com');

    INSERT INTO identity_user (id, email, password_hash, full_name_vi, is_active, created_at, updated_at)
    SELECT v_user_reception, 'reception@example.com', v_password_hash, 'Lễ tân Trần Hồng', true, now(), now()
    WHERE NOT EXISTS (SELECT 1 FROM identity_user WHERE email = 'reception@example.com');

    -- Assign Roles
    INSERT INTO identity_user_role (id, user_id, role_id, tenant_id, branch_id, created_at)
    SELECT gen_random_uuid(), u.id, v_role_doctor, v_tenant_id, v_branch_id, now()
    FROM identity_user u WHERE u.email = 'doctor@example.com'
    AND NOT EXISTS (SELECT 1 FROM identity_user_role iur WHERE iur.user_id = u.id AND iur.role_id = v_role_doctor);

    INSERT INTO identity_user_role (id, user_id, role_id, tenant_id, branch_id, created_at)
    SELECT gen_random_uuid(), u.id, v_role_nurse, v_tenant_id, v_branch_id, now()
    FROM identity_user u WHERE u.email = 'nurse@example.com'
    AND NOT EXISTS (SELECT 1 FROM identity_user_role iur WHERE iur.user_id = u.id AND iur.role_id = v_role_nurse);

    -- 3. Patients (Robust Not Exists check)
    INSERT INTO patient (id, tenant_id, external_id, cccd, full_name_vi, date_of_birth, gender, phone, address_line, blood_type, allergies, chronic_conditions, created_at, updated_at, nationality, is_active)
    SELECT v_patient_1, v_tenant_id, 'BN001', '001090123456', 'Nguyễn Văn Mạnh', '1985-05-20', 'MALE', '0901234567', '123 CMT8, Q3, TP.HCM', 'O+', 'Hải sản', 'Tiểu đường Type 2', now(), now(), 'VN', true
    WHERE NOT EXISTS (SELECT 1 FROM patient WHERE cccd = '001090123456');

    INSERT INTO patient (id, tenant_id, external_id, cccd, full_name_vi, date_of_birth, gender, phone, address_line, blood_type, allergies, chronic_conditions, created_at, updated_at, nationality, is_active)
    SELECT v_patient_2, v_tenant_id, 'BN002', '001090654321', 'Trần Thị Thúy', '1992-11-12', 'FEMALE', '0988776655', '45 Hai Bà Trưng, Q1, TP.HCM', 'A+', 'Penicillin', 'Không', now(), now(), 'VN', true
    WHERE NOT EXISTS (SELECT 1 FROM patient WHERE cccd = '001090654321');

    INSERT INTO patient (id, tenant_id, external_id, cccd, full_name_vi, date_of_birth, gender, phone, address_line, blood_type, allergies, chronic_conditions, created_at, updated_at, nationality, is_active)
    SELECT v_patient_3, v_tenant_id, 'BN003', '001088000111', 'Lê Văn Chính', '1950-01-01', 'MALE', '0912121212', '10 Phan Xích Long, Phú Nhuận', 'B-', 'Không', 'Cao huyết áp', now(), now(), 'VN', true
    WHERE NOT EXISTS (SELECT 1 FROM patient WHERE cccd = '001088000111');

    -- 4. Queue Setup
    INSERT INTO queue_definition (id, branch_id, code, name_vi, is_active, created_at, updated_at)
    SELECT gen_random_uuid(), v_branch_id, 'PHONG_KHAM_NOI', 'Phòng Khám Nội', true, now(), now()
    WHERE NOT EXISTS (SELECT 1 FROM queue_definition WHERE code = 'PHONG_KHAM_NOI');
    
    SELECT id INTO v_queue_id FROM queue_definition WHERE code = 'PHONG_KHAM_NOI' LIMIT 1;

    -- 5. Live Queue Entries (Clean up old demo entries if re-run)
    DELETE FROM queue_entry WHERE queue_definition_id = v_queue_id AND position IN (101, 102, 103);

    INSERT INTO queue_entry (id, tenant_id, branch_id, queue_definition_id, patient_id, position, status, joined_at, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, v_queue_id, p.id, 101, 'WAITING', now() - interval '15 minutes', now() - interval '15 minutes', now()
    FROM patient p WHERE p.cccd = '001090123456';

    INSERT INTO queue_entry (id, tenant_id, branch_id, queue_definition_id, patient_id, position, status, joined_at, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, v_queue_id, p.id, 102, 'WAITING', now() - interval '10 minutes', now() - interval '10 minutes', now()
    FROM patient p WHERE p.cccd = '001090654321';

    -- 6. Done entries
    INSERT INTO clinical_consultation (id, tenant_id, branch_id, patient_id, doctor_user_id, status, started_at, ended_at, chief_complaint_summary, diagnosis_notes, prescription_notes, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, p.id, (SELECT id FROM identity_user WHERE email = 'doctor@example.com'), 'COMPLETED', now() - interval '2 hours', now() - interval '1 hour', 
            'Đau dạ dày', 'Viêm dạ dày', 'Nexium 40mg', now() - interval '2 hours', now()
    FROM patient p WHERE p.cccd = '001088000111'
    AND NOT EXISTS (SELECT 1 FROM clinical_consultation cc WHERE cc.patient_id = p.id);

END $$;
