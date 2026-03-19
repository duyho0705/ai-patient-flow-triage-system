package vn.clinic.cdm.service.clinical.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.dto.ai.RiskPatientDto;
import vn.clinic.cdm.common.constant.ManagementConstants;
import vn.clinic.cdm.service.clinical.ClinicalRiskService;
import vn.clinic.cdm.repository.clinical.HealthMetricRepository;
import vn.clinic.cdm.entity.clinical.HealthMetric;
import vn.clinic.cdm.entity.clinical.risk.RiskAssessmentRule;
import vn.clinic.cdm.entity.patient.Patient;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Clinical Risk Identification.
 * Refactored to 3-layer architecture.
 */
@Service("clinicalRiskService")
@RequiredArgsConstructor
@Slf4j
public class ClinicalRiskServiceImpl implements ClinicalRiskService {

    private final HealthMetricRepository healthMetricRepository;
    private final List<RiskAssessmentRule> riskRules;

    @Override
    public List<RiskPatientDto> identifyRiskPatients(List<Patient> patients) {
        if (patients == null || patients.isEmpty()) {
            return Collections.emptyList();
        }
        
        log.info("Executing ClinicalRiskService for {} patients using {} rules", 
                patients.size(), riskRules.size());
        
        return patients.stream()
                .filter(Objects::nonNull)
                .map(this::assessPatientRisk)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private RiskPatientDto assessPatientRisk(Patient p) {
        log.debug("Assessing risk rules for patient: {}", p.getId());
        List<HealthMetric> logs = healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(p.getId());

        if (logs.isEmpty()) {
            return null;
        }

        Map<String, List<HealthMetric>> metricsByType = logs.stream()
                .collect(Collectors.groupingBy(HealthMetric::getMetricType));

        String finalRiskLevel = ManagementConstants.RiskLevel.LOW;
        List<String> allReasons = new ArrayList<>();
        String mainTrend = "Stable";

        // Domain Logic Bridge: Strategy execution
        for (RiskAssessmentRule rule : riskRules) {
            RiskAssessmentRule.RiskResult result = rule.evaluate(metricsByType);
            
            finalRiskLevel = prioritizeRisk(finalRiskLevel, result.level());
            allReasons.addAll(result.reasons());
        }

        if (ManagementConstants.RiskLevel.LOW.equals(finalRiskLevel)) {
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

    private String prioritizeRisk(String current, String candidate) {
        if (ManagementConstants.RiskLevel.CRITICAL.equals(candidate)) return ManagementConstants.RiskLevel.CRITICAL;
        if (ManagementConstants.RiskLevel.HIGH.equals(candidate) && !ManagementConstants.RiskLevel.CRITICAL.equals(current)) return ManagementConstants.RiskLevel.HIGH;
        if (ManagementConstants.RiskLevel.MEDIUM.equals(candidate) && !ManagementConstants.RiskLevel.CRITICAL.equals(current) && !ManagementConstants.RiskLevel.HIGH.equals(current)) return ManagementConstants.RiskLevel.MEDIUM;
        return current;
    }
}
