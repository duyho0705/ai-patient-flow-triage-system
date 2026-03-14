package vn.clinic.cdm.clinical.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.api.dto.ai.RiskPatientDto;
import vn.clinic.cdm.clinical.domain.HealthMetric;
import vn.clinic.cdm.clinical.repository.HealthMetricRepository;
import vn.clinic.cdm.clinical.service.risk.RiskAssessmentRule;
import vn.clinic.cdm.patient.domain.Patient;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Clinical Risk Assessment Service.
 * Follows Strategy Pattern (SOLID) for extensible risk rules.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicalRiskService {

    private final HealthMetricRepository healthMetricRepository;
    private final List<RiskAssessmentRule> riskRules;

    /**
     * Identifies high-risk patients based on all registered risk assessment rules.
     */
    public List<RiskPatientDto> identifyRiskPatients(List<Patient> patients) {
        if (patients == null || patients.isEmpty()) {
            return Collections.emptyList();
        }
        
        log.info("Starting risk assessment for {} patients using {} rules", patients.size(), riskRules.size());
        
        return patients.stream()
                .filter(Objects::nonNull)
                .map(this::assessPatientRisk)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private RiskPatientDto assessPatientRisk(Patient p) {
        log.debug("Assessing risk for patient: {}", p.getId());
        List<HealthMetric> logs = healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(p.getId());

        if (logs.isEmpty()) {
            return null;
        }

        Map<String, List<HealthMetric>> metricsByType = logs.stream()
                .collect(Collectors.groupingBy(HealthMetric::getMetricType));

        String finalRiskLevel = "LOW";
        List<String> allReasons = new ArrayList<>();
        String mainTrend = "Stable";

        // Execute all rules (SOLID: O/C Principle)
        for (RiskAssessmentRule rule : riskRules) {
            RiskAssessmentRule.RiskResult result = rule.evaluate(metricsByType);
            
            // Priority assignment for risk level
            if ("CRITICAL".equals(result.level())) {
                finalRiskLevel = "CRITICAL";
            } else if (!"CRITICAL".equals(finalRiskLevel) && "HIGH".equals(result.level())) {
                finalRiskLevel = "HIGH";
            } else if (!"CRITICAL".equals(finalRiskLevel) && !"HIGH".equals(finalRiskLevel) && "MEDIUM".equals(result.level())) {
                finalRiskLevel = "MEDIUM";
            }
            
            allReasons.addAll(result.reasons());
        }

        if ("LOW".equals(finalRiskLevel)) {
            return null;
        }

        return RiskPatientDto.builder()
                .patientId(p.getId())
                .patientName(p.getFullNameVi())
                .patientAvatar(p.getAvatarUrl())
                .riskLevel(finalRiskLevel)
                .reason(String.join(", ", allReasons))
                .lastVitalTrend(allReasons.isEmpty() ? mainTrend : allReasons.get(allReasons.size() - 1))
                .build();
    }
}
