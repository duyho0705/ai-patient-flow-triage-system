package vn.clinic.cdm.service.aiaudit.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.dto.ai.AiAuditRequest;
import vn.clinic.cdm.entity.aiaudit.AiAuditLog;
import vn.clinic.cdm.repository.aiaudit.AiAuditLogRepository;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.service.aiaudit.AiAuditService;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAuditServiceImpl implements AiAuditService {

    private final AiAuditLogRepository repository;

    @Override
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordInteraction(AiAuditRequest request) {
        try {
            AiAuditLog logEntry = AiAuditLog.builder()
                    .tenantId(TenantContext.getTenantId().orElse(null))
                    .featureType(request.featureType())
                    .patientId(request.patientId())
                    .userId(request.userId() != null ? request.userId() : null)
                    .inputData(request.input() != null && request.input().length() > 5000 
                               ? request.input().substring(0, 5000) : request.input())
                    .outputData(request.output() != null && request.output().length() > 5000 
                                ? request.output().substring(0, 5000) : request.output())
                    .latencyMs(request.latencyMs())
                    .status(request.status())
                    .errorMessage(request.errorMessage())
                    .build();

            repository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to record AI interaction: {}", e.getMessage());
        }
    }
}
