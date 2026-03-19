package vn.clinic.cdm.service.clinical.impl;
import vn.clinic.cdm.service.clinical.ClinicalContextService;


import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.entity.aiaudit.AiAuditLog;
import vn.clinic.cdm.dto.ai.*;
import vn.clinic.cdm.dto.clinical.*;
import vn.clinic.cdm.dto.medication.*;
import vn.clinic.cdm.entity.clinical.ClinicalConsultation;
import vn.clinic.cdm.common.ai.AiExecutionEngine;
import vn.clinic.cdm.repository.clinical.LabResultRepository;
import vn.clinic.cdm.entity.patient.Patient;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import vn.clinic.cdm.service.clinical.AiClinicalService;

/**
 * Enterprise AI Clinical Service (Refactored).
 * Clean-Code Implementation using AiExecutionEngine for unified management.
 */
@Service("aiClinicalService")
@RequiredArgsConstructor
@Slf4j
public class AiClinicalServiceImpl implements AiClinicalService {

    private final ClinicalContextService contextService;
    private final PromptRegistry promptRegistry;
    private final AiExecutionEngine aiEngine;
    private final LabResultRepository labResultRepository;

    private final Map<UUID, Bucket> branchBuckets = new ConcurrentHashMap<>();

    @Override
    public String suggestTemplates(ClinicalConsultation consultation, List<?> templates) {
        return "AI Template suggestion result.";
    }

    @Override
    public String generateDischargeInstructions(ClinicalConsultation consultation) {
        return "AI Discharge instructions result.";
    }

    @Override
    public TreatmentEfficacyDto analyzeTreatmentEfficacy(ClinicalConsultation consultation) {
        return TreatmentEfficacyDto.builder().overallStatus("STABLE").aiAnalysis("AI Treatment efficacy result.").build();
    }

    @Override
    public StandardizedClinicalNoteDto standardizeClinicalNote(ClinicalConsultation consultation) {
        return StandardizedClinicalNoteDto.builder().soapAssessment("AI Standardized SOAP note.").build();
    }

    @Override
    public String generatePatientHistorySummary(Patient patient) {
        String patientData = "Bệnh nhân: " + patient.getFullNameVi() + ", Giới tính: " + patient.getGender() +
                ", Tình trạng mãn tính: " + patient.getChronicConditions();
        String prompt = "Dựa trên dữ liệu cơ bản sau, hãy tóm tắt lịch sử bệnh của bệnh nhân và các điểm cần lưu ý: " + patientData;
        return aiEngine.executeText(AiAuditLog.AiFeatureType.CLINICAL_SUPPORT, patient.getId(), prompt, "⚠ Link tới AI summary lỗi.");
    }

    private Bucket getBucket(UUID branchId) {
        return branchBuckets.computeIfAbsent(branchId, k -> Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(20).refillIntervally(20, Duration.ofMinutes(1)).build())
                .build());
    }

    @Cacheable(value = "ai_support", key = "#consultation.id")
    public String getClinicalSupport(ClinicalConsultation consultation) {
        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getClinicalSupportPrompt(context);
        
        return aiEngine.executeText(AiAuditLog.AiFeatureType.CLINICAL_SUPPORT, 
                consultation.getPatient().getId(), prompt, "⚠ AI Support unavailable.");
    }

    public String generateLongTermCarePlan(ClinicalConsultation consultation) {
        if (!getBucket(consultation.getBranch().getId()).tryConsume(1)) {
            return "⚠ Hệ thống đang bận. Kế hoạch chăm sóc sẽ cập nhật sau.";
        }

        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getCarePlanPrompt(context);

        return aiEngine.executeText(AiAuditLog.AiFeatureType.CARE_PLAN,
                consultation.getPatient().getId(), prompt, "⚠ Không thể tạo kế hoạch chăm sóc tự động.");
    }

    public PrescriptionVerificationDto verifyPrescription(ClinicalConsultation consultation, List<PrescriptionItemDto> items) {
        String patientData = contextService.buildStandardMedicalContext(consultation);
        String rxData = items.stream().map(it -> "- " + it.getProductName() + "x" + it.getQuantity())
                .collect(Collectors.joining("\n"));

        String prompt = promptRegistry.getPrescriptionVerifyPrompt(patientData, rxData);

        return aiEngine.execute(AiAuditLog.AiFeatureType.PRESCRIPTION_VERIFY, consultation.getPatient().getId(), prompt,
                PrescriptionVerificationDto.class, () -> PrescriptionVerificationDto.builder()
                        .status("WARNING").summary("⚠ Lỗi kiêm tra đơn thuốc.").build());
    }

    public Icd10CodeDto suggestIcd10Code(String diagnosis) {
        String prompt = promptRegistry.getIcd10CodingPrompt(diagnosis);
        return aiEngine.execute(AiAuditLog.AiFeatureType.ICD10_CODING, null, prompt,
                Icd10CodeDto.class, () -> Icd10CodeDto.builder().primaryCode("UNKNOWN").build());
    }

    @Cacheable(value = "ai_support", key = "'lab_interp_' + #consultation.id")
    public String interpretLabResults(ClinicalConsultation consultation) {
        String context = contextService.buildStandardMedicalContext(consultation);
        String labData = labResultRepository.findByConsultation(consultation).stream()
                .map(l -> String.format("%s: %s %s", l.getTestName(), l.getValue(), l.getUnit()))
                .collect(Collectors.joining(", "));

        String prompt = promptRegistry.getLabInterpretationPrompt(context, labData);
        return aiEngine.executeText(AiAuditLog.AiFeatureType.CLINICAL_SUPPORT,
                consultation.getPatient().getId(), prompt, "⚠ Lỗi phân tích xét nghiệm.");
    }

    // --- Enterprise UI Supports ---

    public DifferentialDiagnosisDto getDifferentialDiagnosis(ClinicalConsultation consultation) {
        String prompt = promptRegistry.getDifferentialDiagnosisPrompt(contextService.buildStandardMedicalContext(consultation));
        return aiEngine.execute(AiAuditLog.AiFeatureType.DIFFERENTIAL_DIAGNOSIS, consultation.getPatient().getId(), prompt, DifferentialDiagnosisDto.class, () -> null);
    }

    public ClinicalChecklistDto getSuggestedChecklist(ClinicalConsultation consultation) {
        String prompt = promptRegistry.getClinicalChecklistPrompt(contextService.buildStandardMedicalContext(consultation));
        return aiEngine.execute(AiAuditLog.AiFeatureType.CLINICAL_CHECKLIST, consultation.getPatient().getId(), prompt, ClinicalChecklistDto.class, () -> null);
    }

    public String getClinicalChatResponse(ClinicalConsultation consultation, String userMessage, List<AiChatRequest.ChatMessage> history) {
        String context = contextService.buildStandardMedicalContext(consultation);
        String histStr = history != null ? history.stream().map(m -> m.getRole() + ": " + m.getContent()).collect(Collectors.joining("\n")) : "";
        String prompt = promptRegistry.getClinicalChatPrompt(context, userMessage, histStr);
        return aiEngine.executeText(AiAuditLog.AiFeatureType.CHAT, consultation.getPatient().getId(), prompt, "⚠ AI Chat Error.");
    }

    public FollowUpSuggestionDto suggestFollowUp(ClinicalConsultation consultation) {
        String prompt = promptRegistry.getFollowUpSuggestionPrompt(contextService.buildStandardMedicalContext(consultation));
        return aiEngine.execute(AiAuditLog.AiFeatureType.CLINICAL_SUPPORT, consultation.getPatient().getId(), prompt, FollowUpSuggestionDto.class, () -> null);
    }

    public ComplicationRiskDto predictComplicationRisk(ClinicalConsultation consultation) {
        String prompt = promptRegistry.getComplicationRiskPrompt(contextService.buildStandardMedicalContext(consultation));
        return aiEngine.execute(AiAuditLog.AiFeatureType.CARE_PLAN, consultation.getPatient().getId(), prompt, ComplicationRiskDto.class, () -> null);
    }

}
