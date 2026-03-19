package vn.clinic.cdm.service.aiaudit;

import vn.clinic.cdm.dto.ai.AiAuditRequest;

public interface AiAuditService {
    void recordInteraction(AiAuditRequest request);
}
