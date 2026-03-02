package vn.clinic.cdm.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.common.domain.AuditLog;
import vn.clinic.cdm.common.repository.AuditLogRepository;
import vn.clinic.cdm.common.tenant.TenantContext;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String resourceType, String resourceId, String details) {
        UUID tenantId = TenantContext.getTenantId().orElse(null);
        UUID branchId = TenantContext.getBranchId().orElse(null);
        UUID userId = AuthPrincipal.getCurrentUserId();
        String userEmail = AuthPrincipal.getCurrentUserEmail();

        AuditLog log = AuditLog.builder()
                .tenantId(tenantId)
                .branchId(branchId)
                .userId(userId)
                .email(userEmail)
                .action(action)
                .entityName(resourceType)
                .entityId(resourceId != null ? UUID.fromString(resourceId) : null)
                .details(details)
                .createdAt(Instant.now())
                .status("SUCCESS")
                .build();

        auditLogRepository.save(log);
    }
}
