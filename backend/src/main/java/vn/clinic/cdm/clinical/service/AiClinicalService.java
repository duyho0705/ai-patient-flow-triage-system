package vn.clinic.cdm.clinical.service;

// Unused wildcard imports removed
import dev.langchain4j.model.chat.ChatLanguageModel;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.aiaudit.domain.AiAuditLog;
import vn.clinic.cdm.aiaudit.service.AiAuditServiceV2;
import vn.clinic.cdm.api.dto.ai.AiChatRequest;
import vn.clinic.cdm.api.dto.clinical.Icd10CodeDto;
import vn.clinic.cdm.api.dto.medication.PrescriptionItemDto;
import vn.clinic.cdm.api.dto.medication.PrescriptionTemplateDto;
import vn.clinic.cdm.api.dto.medication.PrescriptionVerificationDto;
import vn.clinic.cdm.clinical.domain.ClinicalConsultation;
import vn.clinic.cdm.patient.domain.Patient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enterprise AI Clinical Service.
 * Provides advanced clinical insights using various LLM prompts managed by
 * PromptRegistry.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiClinicalService {

    private final ClinicalContextService contextService;
    private final PromptRegistry promptRegistry;
    private final AiAuditServiceV2 aiAuditService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final vn.clinic.cdm.clinical.repository.LabResultRepository labResultRepository;

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    // Enterprise: Rate Limiting to protect Gemini API quota
    private final Map<UUID, Bucket> branchBuckets = new ConcurrentHashMap<>();

    @Cacheable(value = "ai_support", key = "#consultation.id")
    public String getClinicalSupport(ClinicalConsultation consultation) {
        if (chatModel == null) {
            return "âš ï¸ AI Clinical Support currently unavailable (Gemini not configured).";
        }

        long startTime = System.currentTimeMillis();
        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getClinicalSupportPrompt(context);

        try {
            log.info("Requesting Enterprise Clinical Support for consultation: {}", consultation.getId());
            String res = chatModel.chat(prompt);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CLINICAL_SUPPORT,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return res;
        } catch (Exception e) {
            log.error("AI Clinical Service Error: {}", e.getMessage(), e);
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CLINICAL_SUPPORT,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    null,
                    System.currentTimeMillis() - startTime,
                    "FAILED",
                    e.getMessage());
            return "âš ï¸ Lá»—i khi káº¿t ná»‘i vá»›i AI: " + e.getMessage();
        }
    }

    public String generateLongTermCarePlan(ClinicalConsultation consultation) {
        if (chatModel == null)
            return null;

        if (!getBucket(consultation.getBranch().getId()).tryConsume(1)) {
            log.warn("Rate limit exceeded for AI Insights at branch: {}", consultation.getBranch().getId());
            return "âš ï¸ Há»‡ thá»‘ng Ä‘ang báº­n. Káº¿ hoáº¡ch chÄƒm sÃ³c sáº½ Ä‘Æ°á»£c cáº­p nháº­t sau.";
        }

        long startTime = System.currentTimeMillis();
        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getCarePlanPrompt(context);

        try {
            log.info("Generating long-term care plan for patient: {}", consultation.getPatient().getId());
            String res = chatModel.chat(prompt);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CARE_PLAN,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return res;
        } catch (Exception e) {
            log.error("Long-term care plan error: {}", e.getMessage());
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CARE_PLAN,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    null,
                    System.currentTimeMillis() - startTime,
                    "FAILED",
                    e.getMessage());
            return "âš ï¸ KhÃ´ng thá»ƒ táº¡o káº¿ hoáº¡ch chÄƒm sÃ³c tá»± Ä‘á»™ng.";
        }
    }

    public PrescriptionVerificationDto verifyPrescription(ClinicalConsultation consultation,
            List<PrescriptionItemDto> items) {
        if (chatModel == null)
            return fallbackPrescriptionVerify("AI Model not available");

        long startTime = System.currentTimeMillis();
        String patientData = contextService.buildStandardMedicalContext(consultation);

        StringBuilder rxBuilder = new StringBuilder();
        items.forEach(it -> rxBuilder.append("- ").append(it.getProductName()).append(" (SL: ")
                .append(it.getQuantity()).append("); ").append(it.getDosageInstruction()).append("\n"));

        String prompt = promptRegistry.getPrescriptionVerifyPrompt(patientData, rxBuilder.toString());
        try {
            String res = chatModel.chat(prompt);
            PrescriptionVerificationDto dto = parsePrescriptionJson(res);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.PRESCRIPTION_VERIFY,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return dto;
        } catch (Exception e) {
            log.error("AI Rx verify error: {}", e.getMessage());
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.PRESCRIPTION_VERIFY,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    null,
                    System.currentTimeMillis() - startTime,
                    "FAILED",
                    e.getMessage());
            return fallbackPrescriptionVerify("Error evaluating prescription: " + e.getMessage());
        }
    }

    private PrescriptionVerificationDto parsePrescriptionJson(String res) {
        try {
            String jsonPart = res;
            if (res.contains("{")) {
                jsonPart = res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1);
            }
            return objectMapper.readValue(jsonPart, PrescriptionVerificationDto.class);
        } catch (Exception e) {
            log.error("Failed to parse Rx verification JSON: {}", e.getMessage());
            return fallbackPrescriptionVerify("Invalid AI response format");
        }
    }

    private PrescriptionVerificationDto fallbackPrescriptionVerify(String reason) {
        return PrescriptionVerificationDto.builder()
                .status("WARNING")
                .summary("âš ï¸ KhÃ´ng thá»ƒ tá»± Ä‘á»™ng kiá»ƒm tra Ä‘Æ¡n thuá»‘c lÃºc nÃ y.")
                .aiReasoning(reason)
                .build();
    }

    @Cacheable(value = "ai_support", key = "'history_summary_' + #patient.id")
    public String generatePatientHistorySummary(Patient patient) {
        if (chatModel == null)
            return "AI Summary unavailable";

        long startTime = System.currentTimeMillis();
        // Simplified history for summary
        String prompt = promptRegistry.getPatientHistorySummaryPrompt(patient.getFullNameVi(),
                "Data processed via ClinicalContextService");

        try {
            String res = chatModel.chat(prompt);
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CLINICAL_SUPPORT,
                    patient.getId(),
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return res;
        } catch (Exception e) {
            log.error("History Summary AI Error: {}", e.getMessage());
            return "âš ï¸ KhÃ´ng thá»ƒ tÃ³m táº¯t lá»‹ch sá»­ lÃºc nÃ y.";
        }
    }

    public String suggestTemplates(ClinicalConsultation consultation, List<PrescriptionTemplateDto> templates) {
        if (chatModel == null || templates.isEmpty())
            return "No clinical templates available.";

        long startTime = System.currentTimeMillis();
        String context = contextService.buildStandardMedicalContext(consultation);
        String templatesJson = templates.stream()
                .map(t -> t.getNameVi() + ": " + t.getDescription())
                .collect(java.util.stream.Collectors.joining("\n"));

        String prompt = promptRegistry.getSuggestTemplatesPrompt(context, templatesJson);
        try {
            String res = chatModel.chat(prompt);
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CLINICAL_SUPPORT,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return res;
        } catch (Exception e) {
            log.error("Suggest Templates AI Error: {}", e.getMessage());
            return "âš ï¸ KhÃ´ng thá»ƒ gá»£i Ã½ phÃ¡c Ä‘á»“ ngay lÃºc nÃ y.";
        }
    }

    public String getClinicalChatResponse(ClinicalConsultation consultation, String userMessage,
            List<AiChatRequest.ChatMessage> history) {
        if (chatModel == null)
            return "AI Chat currently unavailable.";

        long startTime = System.currentTimeMillis();
        String context = contextService.buildStandardMedicalContext(consultation);

        String historyStr = history != null ? history.stream()
                .map(m -> String.format("[%s]: %s", m.getRole().toUpperCase(), m.getContent()))
                .collect(java.util.stream.Collectors.joining("\n")) : "";

        String prompt = promptRegistry.getClinicalChatPrompt(context, userMessage, historyStr);

        try {
            String res = chatModel.chat(prompt);
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CHAT,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return res;
        } catch (Exception e) {
            log.error("AI Clinical Chat Error: {}", e.getMessage());
            return "âš ï¸ Lá»—i: " + e.getMessage();
        }
    }

    public Icd10CodeDto suggestIcd10Code(String diagnosis) {
        if (chatModel == null || diagnosis == null || diagnosis.isBlank()) {
            return fallbackIcd10("AI or diagnosis unavailable");
        }

        long startTime = System.currentTimeMillis();
        String prompt = promptRegistry.getIcd10CodingPrompt(diagnosis);

        try {
            String res = chatModel.chat(prompt);
            Icd10CodeDto dto = parseIcd10Json(res);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.ICD10_CODING,
                    null,
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return dto;
        } catch (Exception e) {
            log.error("ICD-10 AI Error: {}", e.getMessage());
            return fallbackIcd10("Error: " + e.getMessage());
        }
    }

    private Icd10CodeDto parseIcd10Json(String res) {
        try {
            String jsonPart = res;
            if (res.contains("{")) {
                jsonPart = res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1);
            }
            return objectMapper.readValue(jsonPart, Icd10CodeDto.class);
        } catch (Exception e) {
            log.error("Failed to parse ICD-10 JSON: {}", e.getMessage());
            return fallbackIcd10("Invalid response format");
        }
    }

    private Icd10CodeDto fallbackIcd10(String reason) {
        return Icd10CodeDto.builder()
                .primaryCode("UNKNOWN")
                .description("KhÃ´ng thá»ƒ tá»± Ä‘á»™ng xÃ¡c Ä‘á»‹nh mÃ£ ICD-10")
                .confidence(0.0)
                .build();
    }

    public vn.clinic.cdm.api.dto.ai.DifferentialDiagnosisDto getDifferentialDiagnosis(
            ClinicalConsultation consultation) {
        if (chatModel == null)
            return null;

        long startTime = System.currentTimeMillis();
        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getDifferentialDiagnosisPrompt(context);

        try {
            String res = chatModel.chat(prompt);
            String jsonPart = res;
            if (res.contains("{")) {
                jsonPart = res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1);
            }
            vn.clinic.cdm.api.dto.ai.DifferentialDiagnosisDto dto = objectMapper.readValue(jsonPart,
                    vn.clinic.cdm.api.dto.ai.DifferentialDiagnosisDto.class);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.DIFFERENTIAL_DIAGNOSIS,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return dto;
        } catch (Exception e) {
            log.error("Differential Diagnosis AI Error: {}", e.getMessage());
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.DIFFERENTIAL_DIAGNOSIS,
                    consultation.getPatient().getId(),
                    null,
                    prompt, null,
                    System.currentTimeMillis() - startTime,
                    "FAILED", e.getMessage());
            return null;
        }
    }

    public vn.clinic.cdm.api.dto.clinical.ClinicalChecklistDto getSuggestedChecklist(
            ClinicalConsultation consultation) {
        if (chatModel == null)
            return null;

        long startTime = System.currentTimeMillis();
        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getClinicalChecklistPrompt(context);

        try {
            String res = chatModel.chat(prompt);
            String jsonPart = res;
            if (res.contains("{")) {
                jsonPart = res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1);
            }
            var dto = objectMapper.readValue(jsonPart,
                    vn.clinic.cdm.api.dto.clinical.ClinicalChecklistDto.class);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CLINICAL_CHECKLIST,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return dto;
        } catch (Exception e) {
            log.error("AI Checklist Error: {}", e.getMessage());
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CLINICAL_CHECKLIST,
                    consultation.getPatient().getId(),
                    null,
                    prompt, null,
                    System.currentTimeMillis() - startTime,
                    "FAILED", e.getMessage());
            return null;
        }
    }

    /**
     * AI-Powered Lab Result Interpretation.
     * Provides clinical significance analysis, abnormal findings correlation,
     * and follow-up test recommendations.
     */
    @Cacheable(value = "ai_support", key = "'lab_interp_' + #consultation.id")
    public String interpretLabResults(ClinicalConsultation consultation) {
        if (chatModel == null)
            return "AI Lab Interpretation is currently unavailable.";

        long startTime = System.currentTimeMillis();
        String context = contextService.buildStandardMedicalContext(consultation);

        // Build lab data JSON from repository
        var labs = labResultRepository.findByConsultation(consultation);
        StringBuilder labJson = new StringBuilder("[");
        labs.forEach(l -> labJson.append(String.format(
                "{\"test\":\"%s\",\"value\":\"%s\",\"unit\":\"%s\",\"ref\":\"%s\",\"status\":\"%s\"},",
                l.getTestName(), l.getValue(),
                l.getUnit() != null ? l.getUnit() : "",
                l.getReferenceRange() != null ? l.getReferenceRange() : "",
                l.getStatus())));
        labJson.append("]");

        String prompt = promptRegistry.getLabInterpretationPrompt(context, labJson.toString());

        try {
            String res = chatModel.chat(prompt);
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CLINICAL_SUPPORT,
                    consultation.getPatient().getId(),
                    null, prompt, res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS", null);
            return res;
        } catch (Exception e) {
            log.error("AI Lab Interpretation Error: {}", e.getMessage());
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CLINICAL_SUPPORT,
                    consultation.getPatient().getId(),
                    null, prompt, null,
                    System.currentTimeMillis() - startTime,
                    "FAILED", e.getMessage());
            return "KhÃ´ng thá»ƒ phÃ¢n tÃ­ch káº¿t quáº£ xÃ©t nghiá»‡m lÃºc nÃ y.";
        }
    }

    /**
     * AI-Generated Discharge Instructions.
     * Creates patient-friendly, easy-to-read discharge notes
     * tailored to the patient's condition and treatment.
     */
    @Cacheable(value = "ai_support", key = "'discharge_' + #consultation.id")
    public String generateDischargeInstructions(ClinicalConsultation consultation) {
        if (chatModel == null)
            return "AI Discharge Instructions is currently unavailable.";

        long startTime = System.currentTimeMillis();
        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getDischargeInstructionsPrompt(context);

        try {
            String res = chatModel.chat(prompt);
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CARE_PLAN,
                    consultation.getPatient().getId(),
                    null, prompt, res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS", null);
            return res;
        } catch (Exception e) {
            log.error("AI Discharge Instructions Error: {}", e.getMessage());
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CARE_PLAN,
                    consultation.getPatient().getId(),
                    null, prompt, null,
                    System.currentTimeMillis() - startTime,
                    "FAILED", e.getMessage());
            return "KhÃ´ng thá»ƒ táº¡o hÆ°á»›ng dáº«n xuáº¥t viá»‡n lÃºc nÃ y.";
        }
    }

    public vn.clinic.cdm.api.dto.ai.FollowUpSuggestionDto suggestFollowUp(ClinicalConsultation consultation) {
        if (chatModel == null)
            return null;

        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getFollowUpSuggestionPrompt(context);

        try {
            String res = chatModel.chat(prompt);
            String jsonPart = res;
            if (res.contains("{")) {
                jsonPart = res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1);
            }
            return objectMapper.readValue(jsonPart, vn.clinic.cdm.api.dto.ai.FollowUpSuggestionDto.class);
        } catch (Exception e) {
            log.error("Follow-up Suggestion AI Error: {}", e.getMessage());
            return null;
        }
    }

    public vn.clinic.cdm.api.dto.ai.TreatmentEfficacyDto analyzeTreatmentEfficacy(
            ClinicalConsultation consultation) {
        if (chatModel == null)
            return null;

        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getTreatmentEfficacyPrompt(context);

        try {
            String res = chatModel.chat(prompt);
            String jsonPart = res;
            if (res.contains("{")) {
                jsonPart = res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1);
            }
            return objectMapper.readValue(jsonPart, vn.clinic.cdm.api.dto.ai.TreatmentEfficacyDto.class);
        } catch (Exception e) {
            log.error("Treatment Efficacy AI Error: {}", e.getMessage());
            return null;
        }
    }

    public vn.clinic.cdm.api.dto.ai.ComplicationRiskDto predictComplicationRisk(
            ClinicalConsultation consultation) {
        if (chatModel == null)
            return null;

        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getComplicationRiskPrompt(context);

        try {
            String res = chatModel.chat(prompt);
            String jsonPart = res;
            if (res.contains("{")) {
                jsonPart = res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1);
            }
            return objectMapper.readValue(jsonPart, vn.clinic.cdm.api.dto.ai.ComplicationRiskDto.class);
        } catch (Exception e) {
            log.error("Risk Prediction AI Error: {}", e.getMessage());
            return null;
        }
    }

    public vn.clinic.cdm.api.dto.clinical.StandardizedClinicalNoteDto standardizeClinicalNote(
            ClinicalConsultation consultation) {
        if (chatModel == null)
            return null;

        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getStandardizedNotePrompt(context);

        try {
            String res = chatModel.chat(prompt);
            String jsonPart = res;
            if (res.contains("{")) {
                jsonPart = res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1);
            }
            return objectMapper.readValue(jsonPart,
                    vn.clinic.cdm.api.dto.clinical.StandardizedClinicalNoteDto.class);
        } catch (Exception e) {
            log.error("Note Standardization AI Error: {}", e.getMessage());
            return null;
        }
    }

    private Bucket getBucket(UUID branchId) {
        return branchBuckets.computeIfAbsent(branchId, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(20, Refill.intervally(20, Duration.ofMinutes(1))))
                .build());
    }
}

