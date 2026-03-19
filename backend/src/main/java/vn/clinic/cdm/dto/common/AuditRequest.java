package vn.clinic.cdm.dto.common;

import java.util.UUID;

public record AuditRequest(
    UUID userId,
    String email,
    String action,
    String details,
    String status,
    String ipAddress,
    String userAgent
) {}
