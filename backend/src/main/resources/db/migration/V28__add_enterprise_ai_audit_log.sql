-- Enterprise AI Audit Log for clinical safety and model monitoring
CREATE TABLE ai_audit_log (
    id UUID PRIMARY KEY,
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

-- Index for multi-tenant analytical queries
CREATE INDEX idx_ai_audit_tenant_feature ON ai_audit_log (tenant_id, feature_type);
CREATE INDEX idx_ai_audit_created_at ON ai_audit_log (created_at DESC);
CREATE INDEX idx_ai_audit_patient ON ai_audit_log (patient_id);
