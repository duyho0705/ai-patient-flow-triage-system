package vn.clinic.cdm.service.report;

import java.util.Map;
import java.util.UUID;

public interface AnalyticsService {
    Map<String, Object> getTodaySummary(UUID tenantId, UUID branchId);
    Map<String, Object> getWeekSummary(UUID tenantId, UUID branchId);
}
