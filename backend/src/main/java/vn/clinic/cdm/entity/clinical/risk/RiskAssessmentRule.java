package vn.clinic.cdm.entity.clinical.risk;

import vn.clinic.cdm.entity.clinical.HealthMetric;
import java.util.List;
import java.util.Map;

/**
 * Domain Policy: Strategy interface for clinical risk assessment rules.
 */
public interface RiskAssessmentRule {
    RiskResult evaluate(Map<String, List<HealthMetric>> metricsByType);
    
    record RiskResult(String level, List<String> reasons) {
        public static RiskResult none() { return new RiskResult("LOW", List.of()); }
    }
}
