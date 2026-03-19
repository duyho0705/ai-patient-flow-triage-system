package vn.clinic.cdm.dto.ai;

import vn.clinic.cdm.entity.aiaudit.AiAuditLog;
import java.util.UUID;

public record AiAuditRequest(
    AiAuditLog.AiFeatureType featureType,
    UUID patientId,
    UUID userId,
    String input,
    String output,
    Long latencyMs,
    String status,
    String errorMessage
) {}
