package vn.clinic.cdm.service.common.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.security.AuthPrincipal;
import vn.clinic.cdm.entity.common.AuditLog;
import vn.clinic.cdm.repository.common.AuditLogRepository;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.service.common.AuditLogService;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
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
                .entityId(resourceId != null ? tryParseUuid(resourceId) : null)
                .details(details)
                .createdAt(Instant.now())
                .status("SUCCESS")
                .build();

        auditLogRepository.save(log);
    }

    private UUID tryParseUuid(String id) {
        try {
            return UUID.fromString(id);
        } catch (Exception e) {
            return null;
        }
    }
}
