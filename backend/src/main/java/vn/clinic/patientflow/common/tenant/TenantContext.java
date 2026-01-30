package vn.clinic.patientflow.common.tenant;

import java.util.Optional;
import java.util.UUID;

/**
 * Thread-local tenant context for multi-tenancy.
 * Set by filter/interceptor after auth; all tenant-scoped queries must use this.
 * Never read tenant from request body – only from token/header/session.
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> TENANT_ID = new ThreadLocal<>();
    private static final ThreadLocal<UUID> BRANCH_ID = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setTenantId(UUID tenantId) {
        TENANT_ID.set(tenantId);
    }

    public static Optional<UUID> getTenantId() {
        return Optional.ofNullable(TENANT_ID.get());
    }

    public static UUID getTenantIdOrThrow() {
        return getTenantId().orElseThrow(() -> new IllegalStateException("Tenant context not set"));
    }

    public static void setBranchId(UUID branchId) {
        BRANCH_ID.set(branchId);
    }

    public static Optional<UUID> getBranchId() {
        return Optional.ofNullable(BRANCH_ID.get());
    }

    public static void clear() {
        TENANT_ID.remove();
        BRANCH_ID.remove();
    }
}
