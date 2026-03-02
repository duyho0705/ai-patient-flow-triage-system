-- V1__Initial_Enterprise_Schema.sql
-- Unified Schema for Chronic Disease Management System (CDM)
-- Optimized for PATIENT, DOCTOR, CLINIC_MANAGER, and SYSTEM_ADMIN roles.
-- This script matches ALL Java domain entities exactly.

-- 0. Setup Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------------------------------------
-- 1. INFRASTRUCTURE & MULTI-TENANCY
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) UNIQUE NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    tax_code VARCHAR(32),
    locale VARCHAR(10) DEFAULT 'vi-VN' NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
    settings_json JSONB,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS tenant_branch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    address_line VARCHAR(500),
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(64) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    is_secret BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    branch_id UUID,
    user_id UUID,
    email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100) DEFAULT 'SYSTEM' NOT NULL,
    entity_id UUID,
    details TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-----------------------------------------------------------
-- 2. IDENTITY ACCESS MANAGEMENT (IAM) & RBAC
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS identity_role (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    description TEXT,
    permissions_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS identity_permission (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    description VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS identity_role_permission (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES identity_role(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES identity_permission(id) ON DELETE CASCADE,
    UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS identity_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenant(id) ON DELETE SET NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name_vi VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    token_version INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS identity_user_role (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES identity_role(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES tenant_branch(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    UNIQUE (user_id, role_id, tenant_id, branch_id)
);

CREATE TABLE IF NOT EXISTS refresh_token (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE CASCADE,
    token VARCHAR(1000) UNIQUE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-----------------------------------------------------------
-- 3. HEALTHCARE RESOURCE PROFILES (DOCTOR & PATIENT)
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS doctor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    identity_user_id UUID UNIQUE NOT NULL REFERENCES identity_user(id) ON DELETE CASCADE,
    specialty VARCHAR(255),
    license_number VARCHAR(50) UNIQUE,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS patient (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    identity_user_id UUID UNIQUE REFERENCES identity_user(id) ON DELETE CASCADE,
    external_id VARCHAR(64),
    cccd VARCHAR(20),
    full_name_vi VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    address_line VARCHAR(500),
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    nationality VARCHAR(100) DEFAULT 'VN',
    ethnicity VARCHAR(100),
    avatar_url TEXT,
    blood_type VARCHAR(10),
    allergies TEXT,
    chronic_conditions TEXT,
    risk_level VARCHAR(20) DEFAULT 'LOW',
    assigned_doctor_id UUID REFERENCES doctor(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

-----------------------------------------------------------
-- 4. MASTER DATA & SCHEDULING
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS medical_service (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    unit_price DECIMAL(15, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS scheduling_slot_template (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS scheduling_calendar_day (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_type VARCHAR(32) NOT NULL,
    open_at TIME,
    close_at TIME,
    notes VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS scheduling_appointment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    slot_start_time TIME NOT NULL,
    slot_end_time TIME,
    status VARCHAR(32) NOT NULL,
    appointment_type VARCHAR(32),
    notes TEXT,
    created_by_user_id UUID REFERENCES identity_user(id),
    doctor_user_id UUID REFERENCES identity_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

-----------------------------------------------------------
-- 5. CLINICAL OPERATIONS: CONSULTATION & RECORDS
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS clinical_consultation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES scheduling_appointment(id) ON DELETE SET NULL,
    doctor_user_id UUID REFERENCES identity_user(id),
    room_or_station VARCHAR(64),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL,
    chief_complaint_summary TEXT,
    diagnosis_notes TEXT,
    prescription_notes TEXT,
    ai_insights TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS clinical_vital (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES clinical_consultation(id) ON DELETE CASCADE,
    vital_type VARCHAR(32) NOT NULL,
    value_numeric DECIMAL(10, 2),
    unit VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS health_metric (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES clinical_consultation(id) ON DELETE SET NULL,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'NORMAL',
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS health_threshold (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    min_value DECIMAL(10, 2),
    max_value DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    UNIQUE (patient_id, metric_type)
);

CREATE TABLE IF NOT EXISTS diagnostic_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES clinical_consultation(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES clinical_consultation(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    value VARCHAR(255),
    unit VARCHAR(64),
    reference_range VARCHAR(255),
    status VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS consultation_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL UNIQUE REFERENCES clinical_consultation(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

-----------------------------------------------------------
-- 6. PRESCRIPTIONS & MEDICATION ADHERENCE
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS prescription_template (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name_vi VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS prescription_template_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES prescription_template(id) ON DELETE CASCADE,
    product_name_custom VARCHAR(255),
    quantity DOUBLE PRECISION NOT NULL,
    dosage_instruction TEXT
);

CREATE TABLE IF NOT EXISTS prescription (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES clinical_consultation(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctor(id) ON DELETE SET NULL,
    diagnosis TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ISSUED' NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS medication (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescription(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    quantity DECIMAL(15, 2),
    unit VARCHAR(50),
    frequency VARCHAR(100),
    instructions TEXT,
    duration_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS medication_reminder (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    reminder_time TIME,
    dosage VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    total_doses_taken INTEGER DEFAULT 0,
    last_taken_at TIMESTAMP WITH TIME ZONE,
    adherence_score DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS medication_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES medication(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    taken_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS medication_dosage_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_reminder_id UUID REFERENCES medication_reminder(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255),
    dosage_instruction VARCHAR(255),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

-----------------------------------------------------------
-- 7. PATIENT ENGAGEMENT & COMMUNICATIONS
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS patient_insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    insurance_type VARCHAR(32) NOT NULL,
    insurance_number VARCHAR(64) NOT NULL,
    holder_name VARCHAR(255),
    valid_from DATE,
    valid_to DATE,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS patient_relative (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    gender VARCHAR(20),
    age INTEGER,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS patient_device_token (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    fcm_token VARCHAR(500) NOT NULL,
    device_type VARCHAR(32),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS patient_chronic_condition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenant(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    icd10_code VARCHAR(32),
    diagnosed_at DATE,
    severity_level VARCHAR(32),
    status VARCHAR(32),
    clinical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS patient_vital_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    vital_type VARCHAR(255) NOT NULL,
    value_numeric DECIMAL(10, 2),
    unit VARCHAR(255),
    recorded_at TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS patient_vital_target (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenant(id) ON DELETE CASCADE,
    vital_type VARCHAR(255) NOT NULL,
    min_value DECIMAL(10, 2),
    max_value DECIMAL(10, 2),
    target_value DECIMAL(10, 2),
    unit VARCHAR(255),
    effective_from DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS patient_chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    doctor_user_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES patient_chat_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    file_url VARCHAR(512)
);

CREATE TABLE IF NOT EXISTS patient_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20),
    related_resource_id VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-----------------------------------------------------------
-- 8. ENTERPRISE BILLING & FINANCE
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS billing_invoice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    consultation_id UUID,
    invoice_number VARCHAR(32) UNIQUE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) NOT NULL,
    final_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    payment_method VARCHAR(32),
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS billing_invoice_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES billing_invoice(id) ON DELETE CASCADE,
    item_code VARCHAR(64),
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    line_total DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID
);

-----------------------------------------------------------
-- 9. ARTIFICIAL INTELLIGENCE & AUDIT
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    user_id UUID,
    patient_id UUID,
    feature_type VARCHAR(32) NOT NULL,
    model_version VARCHAR(64),
    input_data TEXT,
    output_data TEXT,
    latency_ms BIGINT,
    status VARCHAR(32),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_model_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_key VARCHAR(64) NOT NULL,
    version VARCHAR(32) NOT NULL,
    config_json JSONB,
    deployed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deprecated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-----------------------------------------------------------
-- 10. INDEXING FOR PERFORMANCE
-----------------------------------------------------------

CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id);
CREATE INDEX idx_identity_user_tenant ON identity_user(tenant_id);
CREATE INDEX idx_patient_tenant ON patient(tenant_id);
CREATE INDEX idx_consultation_patient ON clinical_consultation(patient_id);
CREATE INDEX idx_health_metric_patient ON health_metric(patient_id);
CREATE INDEX idx_prescription_patient ON prescription(patient_id);

-----------------------------------------------------------
-- 11. ENTERPRISE SEED DATA
-----------------------------------------------------------

-- Initial Roles
INSERT INTO identity_role (id, code, name_vi, description) VALUES 
('00000000-0000-0000-0000-000000000001', 'PATIENT', 'Bệnh nhân', 'Bệnh nhân mãn tính cần theo dõi'),
('00000000-0000-0000-0000-000000000002', 'DOCTOR', 'Bác sĩ', 'Bác sĩ điều trị và quản lý chuyên môn'),
('00000000-0000-0000-0000-000000000003', 'CLINIC_MANAGER', 'Quản lý phòng khám', 'Quản lý vận hành và báo cáo phòng khám'),
('00000000-0000-0000-0000-000000000004', 'SYSTEM_ADMIN', 'Quản trị hệ thống', 'Quản trị viên hạ tầng và cấu hình hệ thống');

-- Default System Tenant
INSERT INTO tenant (id, code, name_vi, tax_code) VALUES 
('00000000-0000-0000-0001-000000000001', 'SYS_ADMIN', 'Hệ thống Quản trị Trung tâm', '0000000001');

-- Default Admin User (admin / change-me)
-- Password Hash for 'change-me'
INSERT INTO identity_user (id, tenant_id, username, email, password_hash, full_name_vi, is_active) VALUES 
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0001-000000000001', 'admin', 'admin@vnclinic.cdm', '$2a$10$8.UnVuG9HHgffUDAlk8Kn.2NvEbWpsNWCQV.P7L576rOf1.L73Ppa', 'Quản trị viên Hệ thống', TRUE);

-- Map Admin to SYSTEM_ADMIN role
INSERT INTO identity_user_role (id, user_id, role_id, tenant_id) VALUES 
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000001');

-- Default system thresholds
INSERT INTO system_config (config_key, config_value, description) VALUES 
('threshold_glucose_max', '180', 'Default max blood glucose value (mg/dL)'),
('threshold_blood_pressure_systolic_max', '140', 'Default max systolic blood pressure'),
('threshold_blood_pressure_diastolic_max', '90', 'Default max diastolic blood pressure');
