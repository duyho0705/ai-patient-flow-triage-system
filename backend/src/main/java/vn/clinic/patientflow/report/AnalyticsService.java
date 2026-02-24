package vn.clinic.patientflow.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.aiaudit.repository.AiTriageAuditRepository;
import vn.clinic.patientflow.queue.repository.QueueEntryRepository;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TriageSessionRepository triageSessionRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final AiTriageAuditRepository aiTriageAuditRepository;

    public Map<String, Object> getTodaySummary(UUID tenantId, UUID branchId) {
        LocalDate today = LocalDate.now();
        Instant startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        // Count triage sessions today
        long triageCount = branchId != null
                ? triageSessionRepository.countByBranchIdAndStartedAtBetween(branchId, startOfDay, endOfDay)
                : triageSessionRepository.countByTenantIdAndStartedAtBetween(tenantId, startOfDay, endOfDay);

        // Count completed queue entries today
        long completedCount = branchId != null
                ? queueEntryRepository.countByBranchIdAndStatusAndCompletedAtBetween(branchId, "COMPLETED", startOfDay,
                        endOfDay)
                : queueEntryRepository.countByTenantIdAndStatusAndCompletedAtBetween(tenantId, "COMPLETED", startOfDay,
                        endOfDay);

        // AI match rate today
        long totalAiCalls = branchId != null
                ? aiTriageAuditRepository.countByTriageSessionBranchIdAndCalledAtBetween(branchId, startOfDay, endOfDay)
                : aiTriageAuditRepository.countByTriageSessionTenantIdAndCalledAtBetween(tenantId, startOfDay,
                        endOfDay);

        long matchedCount = branchId != null
                ? aiTriageAuditRepository.countByTriageSessionBranchIdAndMatchedTrueAndCalledAtBetween(branchId,
                        startOfDay, endOfDay)
                : aiTriageAuditRepository.countByTriageSessionTenantIdAndMatchedTrueAndCalledAtBetween(tenantId,
                        startOfDay, endOfDay);

        double aiMatchRate = totalAiCalls > 0 ? (double) matchedCount / totalAiCalls * 100 : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("triageCount", triageCount);
        result.put("completedCount", completedCount);
        result.put("aiMatchRate", Math.round(aiMatchRate * 10) / 10.0);
        result.put("totalAiCalls", totalAiCalls);
        result.put("date", today.toString());
        return result;
    }

    public Map<String, Object> getWeekSummary(UUID tenantId, UUID branchId) {
        LocalDate today = LocalDate.now();
        Instant startOfWeek = today.minusDays(6).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfWeek = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        long triageCount = branchId != null
                ? triageSessionRepository.countByBranchIdAndStartedAtBetween(branchId, startOfWeek, endOfWeek)
                : triageSessionRepository.countByTenantIdAndStartedAtBetween(tenantId, startOfWeek, endOfWeek);

        long completedCount = branchId != null
                ? queueEntryRepository.countByBranchIdAndStatusAndCompletedAtBetween(branchId, "COMPLETED", startOfWeek,
                        endOfWeek)
                : queueEntryRepository.countByTenantIdAndStatusAndCompletedAtBetween(tenantId, "COMPLETED", startOfWeek,
                        endOfWeek);

        Map<String, Object> result = new HashMap<>();
        result.put("triageCount", triageCount);
        result.put("completedCount", completedCount);
        result.put("periodDays", 7);
        result.put("avgPerDay", Math.round((double) triageCount / 7.0 * 10) / 10.0);
        return result;
    }
}
