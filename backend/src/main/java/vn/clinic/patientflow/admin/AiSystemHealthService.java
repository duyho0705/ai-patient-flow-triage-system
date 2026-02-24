package vn.clinic.patientflow.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.aiaudit.repository.AiAuditLogRepository;
import vn.clinic.patientflow.api.dto.AiSystemHealthDto;

import java.util.HashMap;
import java.util.Map;

/**
 * Enterprise AI System Health & Analytics Service.
 * Aggregates audit log data for real-time monitoring of AI subsystems.
 * Dashboard-ready metrics: success rates, latencies, cost estimation, feature
 * usage heat-map.
 */
@Service
@RequiredArgsConstructor
public class AiSystemHealthService {

    private final AiAuditLogRepository auditLogRepository;

    // Estimated cost per AI call (Gemini Pro pricing approximation)
    private static final Map<String, Double> COST_PER_FEATURE = Map.of(
            "TRIAGE", 0.005,
            "CDS", 0.01,
            "CLINICAL_SUPPORT", 0.015,
            "CARE_PLAN", 0.02,
            "PRESCRIPTION_VERIFY", 0.01,
            "CHAT", 0.008,
            "PHARMACY", 0.008,
            "DIFFERENTIAL_DIAGNOSIS", 0.015,
            "CLINICAL_CHECKLIST", 0.01,
            "ICD10_CODING", 0.005);

    @Cacheable(value = "dashboards", key = "'ai_health'")
    public AiSystemHealthDto getSystemHealth() {
        long total = auditLogRepository.count();
        long success = auditLogRepository.countByStatus("SUCCESS");
        long failure = auditLogRepository.countByStatus("FAILED");
        Double avgLatency = auditLogRepository.getAverageSuccessLatency();

        Map<String, Long> featureCounts = new HashMap<>();
        auditLogRepository.getCountByFeatureType().forEach(row -> featureCounts.put(row[0].toString(), (Long) row[1]));

        double successRate = total > 0 ? (double) success / total : 0;

        // Per-feature cost estimation
        double estimatedCost = featureCounts.entrySet().stream()
                .mapToDouble(e -> COST_PER_FEATURE.getOrDefault(e.getKey(), 0.01) * e.getValue())
                .sum();

        return AiSystemHealthDto.builder()
                .totalInteractions(total)
                .successCount(success)
                .failureCount(failure)
                .successRate(successRate)
                .averageLatencyMs(avgLatency != null ? avgLatency : 0)
                .interactionsByFeature(featureCounts)
                .estimatedCostUsd(estimatedCost)
                .build();
    }
}
