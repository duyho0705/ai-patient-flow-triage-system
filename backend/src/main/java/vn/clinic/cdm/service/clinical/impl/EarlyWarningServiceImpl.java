package vn.clinic.cdm.service.clinical.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.entity.aiaudit.AiAuditLog;
import vn.clinic.cdm.dto.ai.ClinicalEarlyWarningDto;
import vn.clinic.cdm.entity.clinical.ClinicalConsultation;
import vn.clinic.cdm.common.ai.AiExecutionEngine;

import vn.clinic.cdm.service.clinical.EarlyWarningService;
import vn.clinic.cdm.service.clinical.ClinicalContextService;

/**
 * Enterprise Early Warning Service (Refactored).
 * Analyzes patient deterioration risk using NEWS2 & AI.
 * Clean Code: Delegated context and execution to specialized engines.
 */
@Service("earlyWarningService")
@RequiredArgsConstructor
@Slf4j
public class EarlyWarningServiceImpl implements EarlyWarningService {

    private final ClinicalContextService contextService;
    private final AiExecutionEngine aiEngine;
    private final PromptRegistry promptRegistry;

    @Cacheable(value = "ai_support", key = "'ews_' + #consultation.id")
    public ClinicalEarlyWarningDto calculateEarlyWarning(ClinicalConsultation consultation) {
        String patientData = contextService.buildStandardMedicalContext(consultation);
        
        // Use standard context for trend analysis
        String prompt = promptRegistry.getEarlyWarningPrompt(patientData, "Trend analyzed from historical context");

        return aiEngine.execute(AiAuditLog.AiFeatureType.CLINICAL_SUPPORT, 
                consultation.getPatient().getId(), prompt, 
                ClinicalEarlyWarningDto.class, () -> fallbackWarning("AI Analysis Unavailable"));
    }

    private ClinicalEarlyWarningDto fallbackWarning(String message) {
        return ClinicalEarlyWarningDto.builder()
                .news2Score(0)
                .riskLevel("UNKNOWN")
                .aiClinicalAssessment("⚠ " + message)
                .build();
    }
}
