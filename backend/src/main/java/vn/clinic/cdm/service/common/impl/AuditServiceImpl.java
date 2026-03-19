package vn.clinic.cdm.service.common.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.dto.common.AuditRequest;
import vn.clinic.cdm.entity.common.AuditLog;
import vn.clinic.cdm.repository.common.AuditLogRepository;
import vn.clinic.cdm.service.common.AuditService;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Async
    public void log(AuditRequest request) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .tenantId(TenantContext.getTenantId().orElse(null))
                    .userId(request.userId())
                    .email(request.email())
                    .action(request.action())
                    .details(request.details())
                    .status(request.status())
                    .ipAddress(request.ipAddress())
                    .userAgent(request.userAgent())
                    .createdAt(Instant.now())
                    .build();
            auditLogRepository.saveAndFlush(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }

    @Override
    public void logSuccess(AuditRequest request) {
        log(new AuditRequest(
            request.userId(),
            request.email(),
            request.action(),
            request.details(),
            "SUCCESS",
            request.ipAddress(),
            request.userAgent()
        ));
    }

    @Override
    public void logFailure(AuditRequest request) {
        log(new AuditRequest(
            request.userId(),
            request.email(),
            request.action(),
            request.details(),
            "FAILED",
            request.ipAddress(),
            request.userAgent()
        ));
    }
}
