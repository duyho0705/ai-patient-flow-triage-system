package vn.clinic.cdm.clinical.service.risk;

import org.springframework.stereotype.Component;
import vn.clinic.cdm.clinical.domain.HealthMetric;
import vn.clinic.cdm.clinical.domain.VitalSignsThresholds;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Vital Signs Risk Assessment Rule.
 * Leverages VitalSignsThresholds for clinical constants.
 */
@Component
public class VitalSignsRiskRule implements RiskAssessmentRule {

    @Override
    public RiskResult evaluate(Map<String, List<HealthMetric>> metricsByType) {
        String riskLevel = "LOW";
        List<String> reasons = new ArrayList<>();

        for (Map.Entry<String, List<HealthMetric>> entry : metricsByType.entrySet()) {
            String type = entry.getKey();
            List<HealthMetric> typeLogs = entry.getValue();
            if (typeLogs.isEmpty()) continue;
            
            HealthMetric latest = typeLogs.get(0);
            BigDecimal value = latest.getValue();

            if (VitalSignsThresholds.isCritical(type, value)) {
                riskLevel = "CRITICAL";
                reasons.add(String.format("Chỉ số %s ở mức nguy hiểm: %s", VitalSignsThresholds.getLabel(type), value));
            } else if ("LOW".equals(riskLevel) && VitalSignsThresholds.isAbnormal(type, value)) {
                riskLevel = "HIGH";
                reasons.add(String.format("Chỉ số %s vượt ngưỡng: %s", VitalSignsThresholds.getLabel(type), value));
            }

            if (typeLogs.size() >= 3 && isWorsening(type, typeLogs.subList(0, 3))) {
                if (!"CRITICAL".equals(riskLevel)) riskLevel = "HIGH";
                reasons.add(String.format("Xu hướng %s đang xấu đi", VitalSignsThresholds.getLabel(type)));
            }
        }

        return new RiskResult(riskLevel, reasons);
    }

    private boolean isWorsening(String type, List<HealthMetric> last3) {
        if (last3.size() < 3) return false;
        
        double v1 = last3.get(0).getValue().doubleValue();
        double v2 = last3.get(1).getValue().doubleValue();
        double v3 = last3.get(2).getValue().doubleValue();

        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE", "BLOOD_PRESSURE_SYS", "BLOOD_PRESSURE_DIA" -> v1 > v2 && v2 > v3;
            case "SPO2" -> v1 < v2 && v2 < v3;
            default -> false;
        };
    }
}
