package vn.clinic.cdm.clinical.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.aiaudit.domain.AiAuditLog;
import vn.clinic.cdm.aiaudit.service.AiAuditServiceV2;
import vn.clinic.cdm.api.dto.ai.ClinicalEarlyWarningDto;
import vn.clinic.cdm.clinical.domain.ClinicalConsultation;
import vn.clinic.cdm.clinical.domain.ClinicalVital;
import vn.clinic.cdm.clinical.domain.HealthMetric;
import vn.clinic.cdm.clinical.repository.ClinicalVitalRepository;
import vn.clinic.cdm.clinical.repository.HealthMetricRepository;
import vn.clinic.cdm.patient.repository.PatientChronicConditionRepository;
import vn.clinic.cdm.patient.repository.PatientVitalTargetRepository;
import vn.clinic.cdm.clinical.repository.MedicationScheduleRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Enterprise Early Warning Service.
 * Analyzes vital trends using NEWS2 protocol and AI assessment.
 * Updated for CDM - uses HealthMetric instead of PatientVitalLog.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EarlyWarningService {

        private final HealthMetricRepository healthMetricRepository;
        private final ClinicalVitalRepository clinicalVitalRepository;
        private final PromptRegistry promptRegistry;
        private final AiAuditServiceV2 aiAuditService;
        private final ObjectMapper objectMapper;

        @Autowired(required = false)
        private ChatLanguageModel chatModel;

        private final PatientChronicConditionRepository chronicConditionRepository;
        private final PatientVitalTargetRepository vitalTargetRepository;
        private final MedicationScheduleRepository medicationScheduleRepository;

        @Cacheable(value = "ai_support", key = "'ews_' + #consultation.id")
        public ClinicalEarlyWarningDto calculateEarlyWarning(ClinicalConsultation consultation) {
                if (chatModel == null)
                        return fallbackWarning("AI non-configured");

                long startTime = System.currentTimeMillis();
                UUID patientId = consultation.getPatient().getId();

                // Holistic View: CDM Vitals + Clinical Encounter Vitals
                List<HealthMetric> cdmVitals = healthMetricRepository
                                .findByPatientIdOrderByRecordedAtDesc(patientId)
                                .stream().limit(10).collect(Collectors.toList());
                List<ClinicalVital> clinicalVitals = clinicalVitalRepository
                                .findTop10ByConsultationPatientIdOrderByRecordedAtDesc(patientId);

                List<VitalSnapshot> mergedVitals = new ArrayList<>();
                cdmVitals.forEach(v -> mergedVitals.add(
                                new VitalSnapshot(v.getRecordedAt(), v.getMetricType(), v.getValue(), v.getUnit(),
                                                "CDM")));
                clinicalVitals.forEach(v -> mergedVitals.add(
                                new VitalSnapshot(v.getRecordedAt(), v.getVitalType(), v.getValueNumeric(), v.getUnit(),
                                                "CLINICAL")));

                mergedVitals.sort(Comparator.comparing(VitalSnapshot::getTime).reversed());

                String vitalHistory = mergedVitals.stream()
                                .limit(10)
                                .map(v -> String.format("[%s] (%s) %s: %s %s", v.getTime(), v.getSource(), v.getType(),
                                                v.getValue(),
                                                v.getUnit()))
                                .collect(Collectors.joining("\n"));

                // Context enrichment for Chronic Disease Management
                var chronicConditions = chronicConditionRepository.findByPatientId(patientId);
                var vitalTargets = vitalTargetRepository.findByPatientId(patientId);
                var schedules = medicationScheduleRepository.findByMedicationPrescriptionPatientId(patientId);

                String chronicContext = chronicConditions.stream()
                                .map(c -> String.format("- %s (ICD10: %s, Severity: %s, Status: %s)",
                                                c.getConditionName(), c.getIcd10Code(), c.getSeverityLevel(),
                                                c.getStatus()))
                                .collect(Collectors.joining("\n"));

                String targetContext = vitalTargets.stream()
                                .map(t -> String.format("- Target %s: %s - %s %s",
                                                t.getVitalType(), t.getMinValue(), t.getMaxValue(), t.getUnit()))
                                .collect(Collectors.joining("\n"));

                String adherenceContext = schedules.stream()
                                .filter(s -> s.getStatus().equals("TAKEN"))
                                .limit(10)
                                .map(s -> String.format("- %s: Taken at %s",
                                                s.getMedication().getMedicineName(),
                                                s.getTakenAt() != null ? s.getTakenAt() : "Unknown"))
                                .collect(Collectors.joining("\n"));

                String patientData = String.format(
                                "Patient: %s (Age: %s)\nDIAGNOSIS: %s\nCHRONIC CONDITIONS:\n%s\nPERSONALIZED TARGETS:\n%s\nRECENT MEDICATION ADHERENCE:\n%s",
                                consultation.getPatient().getFullNameVi(),
                                consultation.getPatient().getDateOfBirth() != null ? java.time.Period
                                                .between(consultation.getPatient().getDateOfBirth(),
                                                                java.time.LocalDate.now())
                                                .getYears()
                                                : "N/A",
                                consultation.getDiagnosisNotes(),
                                chronicContext.isEmpty() ? "None" : chronicContext,
                                targetContext.isEmpty() ? "Standard intervals" : targetContext,
                                adherenceContext.isEmpty() ? "No recent adherence data" : adherenceContext);

                String prompt = promptRegistry.getEarlyWarningPrompt(patientData, vitalHistory);

                try {
                        String res = chatModel.chat(prompt);
                        ClinicalEarlyWarningDto dto = parseJson(res);

                        aiAuditService.recordInteraction(
                                        AiAuditLog.AiFeatureType.CLINICAL_SUPPORT,
                                        consultation.getPatient().getId(),
                                        null, prompt, res,
                                        System.currentTimeMillis() - startTime,
                                        "SUCCESS", null);

                        return dto;
                } catch (Exception e) {
                        log.error("EWS AI Error: {}", e.getMessage());
                        aiAuditService.recordInteraction(
                                        AiAuditLog.AiFeatureType.CLINICAL_SUPPORT,
                                        consultation.getPatient().getId(),
                                        null, prompt, null,
                                        System.currentTimeMillis() - startTime,
                                        "FAILED", e.getMessage());
                        return fallbackWarning("Analytical error: " + e.getMessage());
                }
        }

        private ClinicalEarlyWarningDto parseJson(String aiResponse) {
                try {
                        String jsonPart = aiResponse;
                        if (aiResponse.contains("{")) {
                                jsonPart = aiResponse.substring(aiResponse.indexOf("{"),
                                                aiResponse.lastIndexOf("}") + 1);
                        }
                        return objectMapper.readValue(jsonPart, ClinicalEarlyWarningDto.class);
                } catch (Exception e) {
                        log.warn("Parsing EWS JSON failed, raw: {}", aiResponse);
                        throw new RuntimeException("Malformed AI Response");
                }
        }

        private ClinicalEarlyWarningDto fallbackWarning(String message) {
                return ClinicalEarlyWarningDto.builder()
                                .news2Score(0)
                                .riskLevel("UNKNOWN")
                                .aiClinicalAssessment("âš ï¸ " + message)
                                .build();
        }

        @lombok.Value
        private static class VitalSnapshot {
                Instant time;
                String type;
                java.math.BigDecimal value;
                String unit;
                String source;
        }
}

