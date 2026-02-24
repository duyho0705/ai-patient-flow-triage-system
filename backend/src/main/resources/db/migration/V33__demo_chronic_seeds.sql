-- =============================================================================
-- Migration V33: Demo Chronic Seeds
-- Populates structured medical goals for our demo patients to showcase AI CDM.
-- =============================================================================

DO $$
DECLARE
    v_patient_manh UUID;
    v_patient_chinh UUID;
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant WHERE code = 'CLINIC_DEMO' LIMIT 1;
    SELECT id INTO v_patient_manh FROM patient WHERE cccd = '001090123456' LIMIT 1;
    SELECT id INTO v_patient_chinh FROM patient WHERE cccd = '001088000111' LIMIT 1;

    IF v_patient_manh IS NOT NULL THEN
        -- 1. Nguyễn Văn Mạnh: Structured Diabetes
        INSERT INTO patient_chronic_condition (patient_id, tenant_id, condition_name, icd10_code, diagnosed_at, severity_level, status, clinical_notes)
        VALUES (v_patient_manh, v_tenant_id, 'Diabetes Mellitus Type 2', 'E11', '2020-01-15', 'PROGRESSING', 'ACTIVE', 'Patient struggling with fasting glucose levels.');

        -- Personal Targets for Manh (Glucose)
        INSERT INTO patient_vital_target (patient_id, tenant_id, vital_type, min_value, max_value, target_value, unit, notes)
        VALUES (v_patient_manh, v_tenant_id, 'GLUCOSE', 3.9, 7.2, 5.5, 'mmol/L', 'Fasting glucose target for stable control.');
    END IF;

    IF v_patient_chinh IS NOT NULL THEN
        -- 2. Lê Văn Chính: Structured Hypertension
        INSERT INTO patient_chronic_condition (patient_id, tenant_id, condition_name, icd10_code, diagnosed_at, severity_level, status, clinical_notes)
        VALUES (v_patient_chinh, v_tenant_id, 'Essential Hypertension', 'I10', '2015-06-20', 'STABLE', 'ACTIVE', 'Controlled with medication, but elderly (Age > 70).');

        -- Personal Targets for Chinh (Blood Pressure - Higher targets for elderly)
        INSERT INTO patient_vital_target (patient_id, tenant_id, vital_type, min_value, max_value, target_value, unit, notes)
        VALUES (v_patient_chinh, v_tenant_id, 'BP_SYSTOLIC', 110, 145, 130, 'mmHg', 'Target BP for elderly patient to prevent orthostatic hypotension.');
    END IF;

END $$;
