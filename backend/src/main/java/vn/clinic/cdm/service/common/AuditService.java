package vn.clinic.cdm.service.common;

import vn.clinic.cdm.dto.common.AuditRequest;

public interface AuditService {
    void log(AuditRequest request);
    
    void logSuccess(AuditRequest request);
    
    void logFailure(AuditRequest request);
}
