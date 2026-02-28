package vn.clinic.cdm.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import vn.clinic.cdm.common.tenant.TenantContext;

import java.io.IOException;
import java.util.UUID;

/**
 * Sets tenant (and optionally branch) from header for multi-tenancy.
 * Header: X-Tenant-Id (required for tenant-scoped APIs), X-Branch-Id (optional).
 * Actuator and public paths can be excluded in SecurityConfig later.
 */
@Component
@Order(1)
@Slf4j
public class TenantFilter implements Filter {

    public static final String HEADER_TENANT_ID = "X-Tenant-Id";
    public static final String HEADER_BRANCH_ID = "X-Branch-Id";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        try {
            if (request instanceof HttpServletRequest httpRequest) {
                String tenantIdHeader = httpRequest.getHeader(HEADER_TENANT_ID);
                if (tenantIdHeader != null && !tenantIdHeader.isBlank()) {
                    try {
                        TenantContext.setTenantId(UUID.fromString(tenantIdHeader.trim()));
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid X-Tenant-Id: {}", tenantIdHeader);
                    }
                }
                String branchIdHeader = httpRequest.getHeader(HEADER_BRANCH_ID);
                if (branchIdHeader != null && !branchIdHeader.isBlank()) {
                    try {
                        TenantContext.setBranchId(UUID.fromString(branchIdHeader.trim()));
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid X-Branch-Id: {}", branchIdHeader);
                    }
                }
            }
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}

