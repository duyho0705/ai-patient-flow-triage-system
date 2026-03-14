package vn.clinic.cdm.clinical.service.risk;

import vn.clinic.cdm.clinical.domain.HealthMetric;
import java.util.List;
import java.util.Map;

/**
 * Strategy interface for clinical risk assessment rules.
 * Adheres to Open/Closed principle: new rules can be added without modifying core service.
 */
public interface RiskAssessmentRule {
    /**
     * Assesses risk based on health metrics. 
     * @return risk level (CRITICAL, HIGH, MEDIUM, none) or reasons found.
     */
    RiskResult evaluate(Map<String, List<HealthMetric>> metricsByType);
    
    record RiskResult(String level, List<String> reasons) {
        public static RiskResult none() { return new RiskResult("LOW", List.of()); }
    }
}
