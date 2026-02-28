package vn.clinic.cdm.clinical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.api.dto.ai.RiskPatientDto;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.clinical.domain.HealthMetric;
import vn.clinic.cdm.clinical.repository.HealthMetricRepository;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicalRiskService {

    private final HealthMetricRepository healthMetricRepository;

    public List<RiskPatientDto> identifyRiskPatients(List<Patient> patients) {
        if (patients == null)
            return Collections.emptyList();
        return patients.stream()
                .filter(Objects::nonNull)
                .map(this::assessPatientRisk)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private RiskPatientDto assessPatientRisk(Patient p) {
        List<HealthMetric> logs = healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(p.getId());

        if (logs.isEmpty())
            return null;

        Map<String, List<HealthMetric>> byType = logs.stream()
                .collect(Collectors.groupingBy(HealthMetric::getMetricType));

        String riskLevel = "LOW";
        List<String> reasons = new ArrayList<>();
        String trendInfo = "Stable";

        for (Map.Entry<String, List<HealthMetric>> entry : byType.entrySet()) {
            String type = entry.getKey();
            List<HealthMetric> typeLogs = entry.getValue();
            HealthMetric latest = typeLogs.get(0);

            if (isCritical(type, latest.getValue())) {
                riskLevel = "CRITICAL";
                reasons.add("Chá»‰ sá»‘ " + getLabel(type) + " á»Ÿ má»©c nguy hiá»ƒm: " + latest.getValue());
            } else if (riskLevel.equals("LOW") && isWarning(type, latest.getValue())) {
                riskLevel = "HIGH";
                reasons.add("Chá»‰ sá»‘ " + getLabel(type) + " vÆ°á»£t ngÆ°á»¡ng: " + latest.getValue());
            }

            if (typeLogs.size() >= 3) {
                if (isWorsening(type, typeLogs.subList(0, 3))) {
                    if (!riskLevel.equals("CRITICAL"))
                        riskLevel = "HIGH";
                    trendInfo = "Xu hÆ°á»›ng " + getLabel(type) + " Ä‘ang xáº¥u Ä‘i";
                    reasons.add(trendInfo);
                }
            }
        }

        if (riskLevel.equals("LOW"))
            return null;

        return RiskPatientDto.builder()
                .patientId(p.getId())
                .patientName(p.getFullNameVi())
                .patientAvatar(p.getAvatarUrl())
                .riskLevel(riskLevel)
                .reason(String.join(", ", reasons))
                .lastVitalTrend(trendInfo)
                .build();
    }

    private boolean isCritical(String type, BigDecimal value) {
        if (value == null)
            return false;
        double val = value.doubleValue();
        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE" -> val > 300 || val < 55;
            case "BLOOD_PRESSURE_SYS" -> val > 180 || val < 80;
            case "BLOOD_PRESSURE_DIA" -> val > 110;
            case "SPO2" -> val < 88;
            case "HEART_RATE" -> val > 130 || val < 45;
            default -> false;
        };
    }

    private boolean isWarning(String type, BigDecimal value) {
        if (value == null)
            return false;
        double val = value.doubleValue();
        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE" -> val > 180 || val < 70;
            case "BLOOD_PRESSURE_SYS" -> val > 140;
            case "BLOOD_PRESSURE_DIA" -> val > 90;
            case "SPO2" -> val < 94;
            default -> false;
        };
    }

    private boolean isWorsening(String type, List<HealthMetric> last3) {
        double v1 = last3.get(0).getValue().doubleValue();
        double v2 = last3.get(1).getValue().doubleValue();
        double v3 = last3.get(2).getValue().doubleValue();

        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE", "BLOOD_PRESSURE_SYS", "BLOOD_PRESSURE_DIA" -> v1 > v2 && v2 > v3;
            case "SPO2" -> v1 < v2 && v2 < v3;
            default -> false;
        };
    }

    private String getLabel(String type) {
        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE" -> "ÄÆ°á»ng huyáº¿t";
            case "BLOOD_PRESSURE_SYS" -> "Huyáº¿t Ã¡p (TÃ¢m thu)";
            case "BLOOD_PRESSURE_DIA" -> "Huyáº¿t Ã¡p (TÃ¢m trÆ°Æ¡ng)";
            case "SPO2" -> "SpO2";
            case "HEART_RATE" -> "Nhá»‹p tim";
            default -> type;
        };
    }
}

