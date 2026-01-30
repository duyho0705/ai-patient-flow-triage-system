-- =============================================================================
-- Migration 00001: Initial schema – AI Patient Flow & Triage (Vietnam clinics)
-- Modular monolith, PostgreSQL 10+ (khuyến nghị 14+)
-- ERD: docs/erd-patient-flow-triage-vi.md
-- =============================================================================
-- PostgreSQL 10–12: bật extension trước khi chạy (gen_random_uuid() cần pgcrypto):
--   CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- PostgreSQL 13+: gen_random_uuid() có sẵn trong core, không cần extension.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TENANT MODULE
-- -----------------------------------------------------------------------------

CREATE TABLE tenant (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(32) NOT NULL,
    name_vi         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255),
    tax_code        VARCHAR(32),
    locale          VARCHAR(10) NOT NULL DEFAULT 'vi-VN',
    timezone        VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    settings_json   JSONB,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_tenant_code UNIQUE (code)
);

CREATE TABLE tenant_branch (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    code         VARCHAR(32) NOT NULL,
    name_vi      VARCHAR(255) NOT NULL,
    address_line VARCHAR(500),
    city         VARCHAR(100),
    district     VARCHAR(100),
    ward         VARCHAR(100),
    phone        VARCHAR(20),
    is_active    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_tenant_branch_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX ix_tenant_branch_tenant_id ON tenant_branch(tenant_id);

COMMENT ON TABLE tenant IS 'Đơn vị thuê (phòng khám / tập đoàn phòng khám). Gốc multi-tenant.';
COMMENT ON TABLE tenant_branch IS 'Chi nhánh vật lý thuộc tenant.';

-- -----------------------------------------------------------------------------
-- 2. IDENTITY MODULE
-- -----------------------------------------------------------------------------

CREATE TABLE identity_user (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255),
    full_name_vi   VARCHAR(255) NOT NULL,
    phone          VARCHAR(20),
    is_active      BOOLEAN NOT NULL DEFAULT true,
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_identity_user_email UNIQUE (email)
);

CREATE TABLE identity_role (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code             VARCHAR(64) NOT NULL,
    name_vi          VARCHAR(255) NOT NULL,
    description      TEXT,
    permissions_json JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_identity_role_code UNIQUE (code)
);

CREATE TABLE identity_user_role (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES identity_user(id) ON DELETE CASCADE,
    role_id    UUID NOT NULL REFERENCES identity_role(id) ON DELETE RESTRICT,
    tenant_id  UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    branch_id  UUID REFERENCES tenant_branch(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_identity_user_role_tenant_role_branch
    ON identity_user_role(user_id, tenant_id, role_id, branch_id) WHERE branch_id IS NOT NULL;
CREATE UNIQUE INDEX uq_identity_user_role_tenant_role_all_branches
    ON identity_user_role(user_id, tenant_id, role_id) WHERE branch_id IS NULL;
CREATE INDEX ix_identity_user_role_user_id ON identity_user_role(user_id);
CREATE INDEX ix_identity_user_role_tenant_id ON identity_user_role(tenant_id);
CREATE INDEX ix_identity_user_role_branch_id ON identity_user_role(branch_id);

COMMENT ON TABLE identity_user IS 'Tài khoản nhân viên / admin.';
COMMENT ON TABLE identity_role IS 'Định nghĩa vai trò (Lễ tân, Y tá phân loại, Bác sĩ, Admin).';
COMMENT ON TABLE identity_user_role IS 'Gán vai trò cho user theo tenant/chi nhánh. branch_id NULL = toàn tenant.';

-- -----------------------------------------------------------------------------
-- 3. PATIENT MODULE
-- -----------------------------------------------------------------------------

CREATE TABLE patient (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id      UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    external_id    VARCHAR(64),
    cccd           VARCHAR(20),
    full_name_vi   VARCHAR(255) NOT NULL,
    date_of_birth  DATE NOT NULL,
    gender         VARCHAR(20),
    phone          VARCHAR(20),
    email          VARCHAR(255),
    address_line   VARCHAR(500),
    city           VARCHAR(100),
    district       VARCHAR(100),
    ward           VARCHAR(100),
    nationality    VARCHAR(100) NOT NULL DEFAULT 'VN',
    ethnicity      VARCHAR(100),
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_patient_gender CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER'))
);

CREATE UNIQUE INDEX uq_patient_tenant_cccd ON patient(tenant_id, cccd) WHERE cccd IS NOT NULL AND cccd != '';
CREATE UNIQUE INDEX uq_patient_tenant_external_id ON patient(tenant_id, external_id) WHERE external_id IS NOT NULL AND external_id != '';
CREATE INDEX ix_patient_tenant_id ON patient(tenant_id);
CREATE INDEX ix_patient_cccd ON patient(cccd) WHERE cccd IS NOT NULL;
CREATE INDEX ix_patient_phone ON patient(tenant_id, phone) WHERE phone IS NOT NULL;

CREATE TABLE patient_insurance (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id       UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    insurance_type   VARCHAR(32) NOT NULL,
    insurance_number VARCHAR(64) NOT NULL,
    holder_name      VARCHAR(255),
    valid_from       DATE,
    valid_to         DATE,
    is_primary       BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_patient_insurance_patient_id ON patient_insurance(patient_id);
CREATE INDEX ix_patient_insurance_patient_primary ON patient_insurance(patient_id, is_primary) WHERE is_primary = true;

COMMENT ON TABLE patient IS 'Bệnh nhân. Mã ngoài: external_id (phòng khám), cccd (CCCD).';
COMMENT ON TABLE patient_insurance IS 'BHYT / bảo hiểm khác. is_primary: một bảo hiểm chính mỗi bệnh nhân.';

-- -----------------------------------------------------------------------------
-- 4. SCHEDULING MODULE
-- -----------------------------------------------------------------------------

CREATE TABLE scheduling_slot_template (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    code              VARCHAR(64) NOT NULL,
    start_time        TIME NOT NULL,
    duration_minutes  SMALLINT NOT NULL,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_scheduling_slot_duration CHECK (duration_minutes > 0)
);

CREATE INDEX ix_scheduling_slot_template_tenant_id ON scheduling_slot_template(tenant_id);

CREATE TABLE scheduling_calendar_day (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id  UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE RESTRICT,
    date       DATE NOT NULL,
    day_type   VARCHAR(32) NOT NULL,
    open_at    TIME,
    close_at   TIME,
    notes      VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_scheduling_calendar_day_branch_date UNIQUE (branch_id, date),
    CONSTRAINT chk_scheduling_calendar_day_type CHECK (day_type IN ('OPEN', 'CLOSED', 'REDUCED'))
);

CREATE INDEX ix_scheduling_calendar_day_branch_id ON scheduling_calendar_day(branch_id);
CREATE INDEX ix_scheduling_calendar_day_date ON scheduling_calendar_day(date);

CREATE TABLE scheduling_appointment (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    branch_id            UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE RESTRICT,
    patient_id           UUID NOT NULL REFERENCES patient(id) ON DELETE RESTRICT,
    appointment_date     DATE NOT NULL,
    slot_start_time      TIME NOT NULL,
    slot_end_time        TIME,
    status               VARCHAR(32) NOT NULL,
    appointment_type     VARCHAR(32),
    notes                TEXT,
    created_by_user_id   UUID REFERENCES identity_user(id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_scheduling_appointment_status CHECK (status IN (
        'SCHEDULED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW', 'COMPLETED'
    ))
);

CREATE INDEX ix_scheduling_appointment_tenant_id ON scheduling_appointment(tenant_id);
CREATE INDEX ix_scheduling_appointment_branch_id ON scheduling_appointment(branch_id);
CREATE INDEX ix_scheduling_appointment_patient_id ON scheduling_appointment(patient_id);
CREATE INDEX ix_scheduling_appointment_branch_date ON scheduling_appointment(branch_id, appointment_date);
CREATE INDEX ix_scheduling_appointment_created_by ON scheduling_appointment(created_by_user_id);

COMMENT ON TABLE scheduling_appointment IS 'Lịch hẹn. status: SCHEDULED → CHECKED_IN/NO_SHOW/CANCELLED/COMPLETED.';

-- -----------------------------------------------------------------------------
-- 5. TRIAGE MODULE
-- -----------------------------------------------------------------------------

CREATE TABLE triage_session (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    branch_id             UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE RESTRICT,
    patient_id            UUID NOT NULL REFERENCES patient(id) ON DELETE RESTRICT,
    appointment_id       UUID REFERENCES scheduling_appointment(id) ON DELETE SET NULL,
    triaged_by_user_id    UUID REFERENCES identity_user(id) ON DELETE SET NULL,
    started_at            TIMESTAMPTZ NOT NULL,
    ended_at              TIMESTAMPTZ,
    acuity_level          VARCHAR(32) NOT NULL,
    acuity_source         VARCHAR(32),
    ai_suggested_acuity   VARCHAR(32),
    ai_confidence_score   NUMERIC(5,4),
    chief_complaint_text  TEXT,
    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_triage_acuity_source CHECK (acuity_source IS NULL OR acuity_source IN ('HUMAN', 'AI', 'HYBRID')),
    CONSTRAINT chk_triage_confidence CHECK (ai_confidence_score IS NULL OR (ai_confidence_score >= 0 AND ai_confidence_score <= 1))
);

CREATE INDEX ix_triage_session_tenant_id ON triage_session(tenant_id);
CREATE INDEX ix_triage_session_branch_id ON triage_session(branch_id);
CREATE INDEX ix_triage_session_patient_id ON triage_session(patient_id);
CREATE INDEX ix_triage_session_patient_started ON triage_session(patient_id, started_at);
CREATE INDEX ix_triage_session_appointment_id ON triage_session(appointment_id);
CREATE INDEX ix_triage_session_triaged_by ON triage_session(triaged_by_user_id);

CREATE TABLE triage_complaint (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    triage_session_id   UUID NOT NULL REFERENCES triage_session(id) ON DELETE CASCADE,
    complaint_type      VARCHAR(64),
    complaint_text      VARCHAR(500) NOT NULL,
    display_order      SMALLINT NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_triage_complaint_triage_session_id ON triage_complaint(triage_session_id);

CREATE TABLE triage_vital (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    triage_session_id   UUID NOT NULL REFERENCES triage_session(id) ON DELETE CASCADE,
    vital_type          VARCHAR(32) NOT NULL,
    value_numeric       NUMERIC(10,2),
    unit                VARCHAR(20),
    recorded_at         TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_triage_vital_triage_session_id ON triage_vital(triage_session_id);

COMMENT ON TABLE triage_session IS 'Phiên phân loại ưu tiên. acuity_source: HUMAN | AI | HYBRID.';
COMMENT ON COLUMN triage_session.ai_confidence_score IS '0–1 nếu model trả về.';

-- -----------------------------------------------------------------------------
-- 6. QUEUE MODULE
-- -----------------------------------------------------------------------------

CREATE TABLE queue_definition (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id      UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE RESTRICT,
    code           VARCHAR(64) NOT NULL,
    name_vi        VARCHAR(255) NOT NULL,
    acuity_filter  VARCHAR(255),
    display_order  SMALLINT NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_queue_definition_branch_code UNIQUE (branch_id, code)
);

CREATE INDEX ix_queue_definition_branch_id ON queue_definition(branch_id);

CREATE TABLE queue_entry (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    branch_id            UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE RESTRICT,
    queue_definition_id  UUID NOT NULL REFERENCES queue_definition(id) ON DELETE RESTRICT,
    patient_id           UUID NOT NULL REFERENCES patient(id) ON DELETE RESTRICT,
    triage_session_id    UUID REFERENCES triage_session(id) ON DELETE SET NULL,
    appointment_id      UUID REFERENCES scheduling_appointment(id) ON DELETE SET NULL,
    position             INT NOT NULL,
    status               VARCHAR(32) NOT NULL,
    joined_at            TIMESTAMPTZ NOT NULL,
    called_at            TIMESTAMPTZ,
    completed_at         TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_queue_entry_status CHECK (status IN (
        'WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
    )),
    CONSTRAINT chk_queue_entry_position CHECK (position >= 1)
);

CREATE INDEX ix_queue_entry_tenant_id ON queue_entry(tenant_id);
CREATE INDEX ix_queue_entry_branch_id ON queue_entry(branch_id);
CREATE INDEX ix_queue_entry_queue_definition_id ON queue_entry(queue_definition_id);
CREATE INDEX ix_queue_entry_patient_id ON queue_entry(patient_id);
CREATE INDEX ix_queue_entry_branch_status_joined ON queue_entry(branch_id, status, joined_at);
CREATE INDEX ix_queue_entry_triage_session_id ON queue_entry(triage_session_id);

COMMENT ON TABLE queue_entry IS 'Một bệnh nhân trong hàng chờ. Thời gian chờ = called_at - joined_at (hoặc now - joined_at nếu đang chờ).';

-- -----------------------------------------------------------------------------
-- 7. CLINICAL MODULE
-- -----------------------------------------------------------------------------

CREATE TABLE clinical_consultation (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
    branch_id                UUID NOT NULL REFERENCES tenant_branch(id) ON DELETE RESTRICT,
    patient_id               UUID NOT NULL REFERENCES patient(id) ON DELETE RESTRICT,
    queue_entry_id           UUID REFERENCES queue_entry(id) ON DELETE SET NULL,
    doctor_user_id           UUID REFERENCES identity_user(id) ON DELETE SET NULL,
    room_or_station          VARCHAR(64),
    started_at               TIMESTAMPTZ NOT NULL,
    ended_at                 TIMESTAMPTZ,
    status                   VARCHAR(32) NOT NULL,
    chief_complaint_summary  TEXT,
    diagnosis_notes          TEXT,
    prescription_notes       TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_clinical_consultation_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX ix_clinical_consultation_tenant_id ON clinical_consultation(tenant_id);
CREATE INDEX ix_clinical_consultation_branch_id ON clinical_consultation(branch_id);
CREATE INDEX ix_clinical_consultation_patient_id ON clinical_consultation(patient_id);
CREATE INDEX ix_clinical_consultation_queue_entry_id ON clinical_consultation(queue_entry_id);
CREATE INDEX ix_clinical_consultation_doctor_user_id ON clinical_consultation(doctor_user_id);

CREATE TABLE clinical_vital (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id  UUID NOT NULL REFERENCES clinical_consultation(id) ON DELETE CASCADE,
    vital_type       VARCHAR(32) NOT NULL,
    value_numeric    NUMERIC(10,2),
    unit             VARCHAR(20),
    recorded_at      TIMESTAMPTZ NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_clinical_vital_consultation_id ON clinical_vital(consultation_id);

-- -----------------------------------------------------------------------------
-- 8. AI AUDIT MODULE
-- -----------------------------------------------------------------------------

CREATE TABLE ai_model_version (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_key     VARCHAR(64) NOT NULL,
    version       VARCHAR(32) NOT NULL,
    config_json   JSONB,
    deployed_at   TIMESTAMPTZ NOT NULL,
    deprecated_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_ai_model_version_model_key ON ai_model_version(model_key);
CREATE INDEX ix_ai_model_version_deprecated ON ai_model_version(deprecated_at) WHERE deprecated_at IS NULL;

CREATE TABLE ai_triage_audit (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    triage_session_id   UUID NOT NULL REFERENCES triage_session(id) ON DELETE RESTRICT,
    model_version_id    UUID NOT NULL REFERENCES ai_model_version(id) ON DELETE RESTRICT,
    input_json          JSONB,
    output_json         JSONB,
    latency_ms         INT,
    called_at           TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_ai_triage_audit_triage_session_id ON ai_triage_audit(triage_session_id);
CREATE INDEX ix_ai_triage_audit_model_version_id ON ai_triage_audit(model_version_id);
CREATE INDEX ix_ai_triage_audit_called_at ON ai_triage_audit(called_at);

COMMENT ON TABLE ai_triage_audit IS 'Kiểm toán mỗi lần gọi AI phân loại. Truy vết cho tuân thủ và an toàn.';

-- -----------------------------------------------------------------------------
-- TRIGGER: updated_at (EXECUTE PROCEDURE tương thích PG10+)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_tenant_updated_at BEFORE UPDATE ON tenant FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_tenant_branch_updated_at BEFORE UPDATE ON tenant_branch FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_identity_user_updated_at BEFORE UPDATE ON identity_user FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_identity_role_updated_at BEFORE UPDATE ON identity_role FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_patient_updated_at BEFORE UPDATE ON patient FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_patient_insurance_updated_at BEFORE UPDATE ON patient_insurance FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_scheduling_slot_template_updated_at BEFORE UPDATE ON scheduling_slot_template FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_scheduling_calendar_day_updated_at BEFORE UPDATE ON scheduling_calendar_day FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_scheduling_appointment_updated_at BEFORE UPDATE ON scheduling_appointment FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_triage_session_updated_at BEFORE UPDATE ON triage_session FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_queue_definition_updated_at BEFORE UPDATE ON queue_definition FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_queue_entry_updated_at BEFORE UPDATE ON queue_entry FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_clinical_consultation_updated_at BEFORE UPDATE ON clinical_consultation FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
