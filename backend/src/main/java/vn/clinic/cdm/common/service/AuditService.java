package vn.clinic.cdm.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.common.domain.AuditLog;
import vn.clinic.cdm.common.repository.AuditLogRepository;
import vn.clinic.cdm.common.tenant.TenantContext;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(UUID userId, String email, String action, String details, String status, String ip, String ua) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .tenantId(TenantContext.getTenantId().orElse(null))
                    .userId(userId)
                    .email(email)
                    .action(action)
                    .details(details)
                    .status(status)
                    .ipAddress(ip)
                    .userAgent(ua)
                    .createdAt(Instant.now())
                    .build();
            auditLogRepository.saveAndFlush(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }

    public void logSuccess(UUID userId, String email, String action, String details, String ip, String ua) {
        log(userId, email, action, details, "SUCCESS", ip, ua);
    }

    public void logFailure(UUID userId, String email, String action, String details, String ip, String ua) {
        log(userId, email, action, details, "FAILED", ip, ua);
    }
}
