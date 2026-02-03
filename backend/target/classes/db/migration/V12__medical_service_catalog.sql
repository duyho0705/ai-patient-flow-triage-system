-- =============================================================================
-- Migration V12: Medical Service Catalog
-- =============================================================================

CREATE TABLE medical_service (
    id                UUID PRIMARY KEY,
    tenant_id         UUID NOT NULL,
    code              VARCHAR(64) NOT NULL,
    name_vi           VARCHAR(255) NOT NULL,
    description       TEXT,
    category          VARCHAR(64), -- EXAM, LAB, IMAGING, PACKAGE
    unit_price        DECIMAL(19,4) NOT NULL DEFAULT 0,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    
    CONSTRAINT fk_service_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (id),
    CONSTRAINT uq_service_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX ix_service_tenant_id ON medical_service(tenant_id);
CREATE INDEX ix_service_category ON medical_service(category);
