-- V8__Fix_IdentityUserRole_and_TenantBranch.sql

-- 1. Rename 'clinic' table to 'tenant_branch' to match Java entity TenantBranch
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clinic') AND 
       NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tenant_branch') THEN
        ALTER TABLE clinic RENAME TO tenant_branch;
    END IF;
END $$;

-- 2. Create tenant_branch if it still doesn't exist (safety)
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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fix identity_user_role table schema to match IdentityUserRole.java
-- Drop the old composite primary key
ALTER TABLE identity_user_role DROP CONSTRAINT IF EXISTS identity_user_role_pkey;

-- Add missing columns
ALTER TABLE identity_user_role ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();
ALTER TABLE identity_user_role ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenant(id);
ALTER TABLE identity_user_role ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES tenant_branch(id);
ALTER TABLE identity_user_role ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Fill tenant_id for existing records (if any) using the user's tenant_id from identity_user
UPDATE identity_user_role ur
SET tenant_id = u.tenant_id
FROM identity_user u
WHERE ur.user_id = u.id AND ur.tenant_id IS NULL;

-- If still NULL (user has no tenant_id), use a default one (e.g., from tenant table)
UPDATE identity_user_role SET tenant_id = (SELECT id FROM tenant LIMIT 1) WHERE tenant_id IS NULL;

-- Now set NOT NULL for mandatory columns
ALTER TABLE identity_user_role ALTER COLUMN id SET NOT NULL;
ALTER TABLE identity_user_role ALTER COLUMN tenant_id SET NOT NULL;

-- Add new primary key
ALTER TABLE identity_user_role ADD PRIMARY KEY (id);

-- Add unique constraint to prevent duplicate roles for the same user in same branch
-- Note: A user can have many roles, so (user_id, role_id, tenant_id, branch_id) should be unique
ALTER TABLE identity_user_role ADD CONSTRAINT identity_user_role_unique UNIQUE (user_id, role_id, tenant_id, branch_id);
