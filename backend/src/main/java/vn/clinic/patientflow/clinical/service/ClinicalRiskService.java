package vn.clinic.patientflow.clinical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.api.dto.RiskPatientDto;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.domain.PatientVitalLog;
import vn.clinic.patientflow.patient.repository.PatientVitalLogRepository;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicalRiskService {

    private final PatientVitalLogRepository vitalLogRepository;

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
        List<PatientVitalLog> logs = vitalLogRepository.findByPatientIdOrderByRecordedAtDesc(p.getId());

        if (logs.isEmpty())
            return null;

        Map<String, List<PatientVitalLog>> byType = logs.stream()
                .collect(Collectors.groupingBy(PatientVitalLog::getVitalType));

        String riskLevel = "LOW";
        List<String> reasons = new ArrayList<>();
        String trendInfo = "Stable";

        for (Map.Entry<String, List<PatientVitalLog>> entry : byType.entrySet()) {
            String type = entry.getKey();
            List<PatientVitalLog> typeLogs = entry.getValue();
            PatientVitalLog latest = typeLogs.get(0);

            if (isCritical(type, latest.getValueNumeric())) {
                riskLevel = "CRITICAL";
                reasons.add("Chỉ số " + getLabel(type) + " ở mức nguy hiểm: " + latest.getValueNumeric());
            } else if (riskLevel.equals("LOW") && isWarning(type, latest.getValueNumeric())) {
                riskLevel = "HIGH";
                reasons.add("Chỉ số " + getLabel(type) + " vượt ngưỡng: " + latest.getValueNumeric());
            }

            if (typeLogs.size() >= 3) {
                if (isWorsening(type, typeLogs.subList(0, 3))) {
                    if (!riskLevel.equals("CRITICAL"))
                        riskLevel = "HIGH";
                    trendInfo = "Xu hướng " + getLabel(type) + " đang xấu đi";
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

    private boolean isWorsening(String type, List<PatientVitalLog> last3) {
        double v1 = last3.get(0).getValueNumeric().doubleValue();
        double v2 = last3.get(1).getValueNumeric().doubleValue();
        double v3 = last3.get(2).getValueNumeric().doubleValue();

        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE", "BLOOD_PRESSURE_SYS", "BLOOD_PRESSURE_DIA" -> v1 > v2 && v2 > v3;
            case "SPO2" -> v1 < v2 && v2 < v3;
            default -> false;
        };
    }

    private String getLabel(String type) {
        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE" -> "Đường huyết";
            case "BLOOD_PRESSURE_SYS" -> "Huyết áp (Tâm thu)";
            case "BLOOD_PRESSURE_DIA" -> "Huyết áp (Tâm trương)";
            case "SPO2" -> "SpO2";
            case "HEART_RATE" -> "Nhịp tim";
            default -> type;
        };
    }
}
