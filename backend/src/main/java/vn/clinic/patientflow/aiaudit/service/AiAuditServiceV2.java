package vn.clinic.patientflow.aiaudit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.aiaudit.domain.AiAuditLog;
import vn.clinic.patientflow.aiaudit.repository.AiAuditLogRepository;
import vn.clinic.patientflow.common.tenant.TenantContext;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAuditServiceV2 {

    private final AiAuditLogRepository repository;

    /**
     * Records an AI interaction asynchronously.
     * propagation = REQUIRES_NEW ensures audit is saved even if main transaction
     * rolls back.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordInteraction(
            AiAuditLog.AiFeatureType featureType,
            UUID patientId,
            UUID userId,
            String input,
            String output,
            Long latencyMs,
            String status,
            String errorMessage) {

        try {
            // If userId is null, try to resolve from security context
            // This works because we now propagate SecurityContext in AsyncConfig
            UUID resolvedUserId = userId;
            if (resolvedUserId == null) {
                try {
                    resolvedUserId = vn.clinic.patientflow.auth.AuthPrincipal.getCurrentUserId();
                } catch (Exception e) {
                    // Ignore if no security context
                }
            }

            AiAuditLog logEntry = AiAuditLog.builder()
                    .tenantId(TenantContext.getTenantId().orElse(null))
                    .branchId(TenantContext.getBranchId().orElse(null))
                    .userId(resolvedUserId)
                    .patientId(patientId)
                    .featureType(featureType)
                    .inputData(input)
                    .outputData(output)
                    .latencyMs(latencyMs)
                    .status(status)
                    .errorMessage(errorMessage)
                    .build();

            repository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to record AI audit log: {}", e.getMessage());
        }
    }
}
