-- NEXORAOS AI: Multi-Tenant Enterprise RBAC & ERP Database Schema
-- Architecture: PostgreSQL + Prisma Patterns
-- 
-- Concepts:
-- 1. True Multi-Tenancy: Every table has a 'tenant_id' (foreign key to schools).
-- 2. Row Level Security (RLS) restricts data access per school.
-- 3. Granular permissions via JSONB (or relation) in RolePermissions.

-- ==========================================
-- TENANT (SCHOOLS)
-- ==========================================
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- USERS & AUTHENTICATION
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROLES & PERMISSIONS (RBAC)
-- ==========================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false, -- True for defaults (e.g. 'Principal', 'Teacher')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

-- User-Role Mapping (A user can have multiple roles in different tenants potentially)
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id, tenant_id)
);

-- Permission Definitions
-- JSONB structure example:
-- {
--   "Admissions": { "view": true, "create": false, "edit": false, "delete": false, "approve": false },
--   "Students": { "view": true, "create": true, "edit": true, "delete": false, "approve": false }
-- }
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_role_permissions_role_id ON role_permissions(role_id);

-- ==========================================
-- SESSIONS & AUDIT LOGS
-- ==========================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    target_resource VARCHAR(255),
    ip_address VARCHAR(45),
    device_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- (PostgreSQL Specific Execution)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Enforce Multi-tenant isolation for roles:
CREATE POLICY tenant_isolation_roles 
    ON roles 
    AS RESTRICTIVE 
    FOR ALL 
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create Policy for accessing Users only inside the allowed Tenant
CREATE POLICY tenant_isolation_user_roles 
    ON user_roles 
    AS RESTRICTIVE 
    FOR ALL 
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Indexing for performance
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_user_email ON users(email);
