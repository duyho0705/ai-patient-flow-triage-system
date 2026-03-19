package vn.clinic.cdm.service.common;

public interface AuditLogService {
    void log(String action, String resourceType, String resourceId, String details);
}
