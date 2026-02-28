package vn.clinic.cdm.api.portal.doctor;

import vn.clinic.cdm.api.dto.ai.*;
import vn.clinic.cdm.api.dto.medication.PrescriptionVerificationDto;
import vn.clinic.cdm.api.dto.medication.PrescriptionItemDto;
import vn.clinic.cdm.api.dto.clinical.Icd10CodeDto;
import vn.clinic.cdm.api.dto.clinical.ClinicalChecklistDto;
import vn.clinic.cdm.api.dto.clinical.StandardizedClinicalNoteDto;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import vn.clinic.cdm.clinical.service.AiClinicalService;
import vn.clinic.cdm.clinical.service.ClinicalContextService;
import vn.clinic.cdm.clinical.service.ClinicalService;
import vn.clinic.cdm.clinical.service.PrescriptionTemplateService;
import vn.clinic.cdm.common.service.PdfService;
import vn.clinic.cdm.common.service.EmailService;
import vn.clinic.cdm.patient.repository.MedicationReminderRepository;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor-portal/ai-support")
@RequiredArgsConstructor
@Tag(name = "Doctor AI Support", description = "CÃ´ng cá»¥ AI há»— trá»£ bÃ¡c sÄ© lÃ¢m sÃ ng")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorAiSupportController {

    private final ClinicalService clinicalService;
    private final AiClinicalService aiClinicalService;
    private final PrescriptionTemplateService templateService;
    private final PdfService pdfService;
    private final ClinicalContextService contextService;
    private final EmailService emailService;
    private final vn.clinic.cdm.common.service.OmniChannelService omniChannelService;
    private final MedicationReminderRepository reminderRepository;

    @PostMapping("/{id}/ai-clinical-support")
    @Operation(summary = "AI Há»— trá»£ cháº©n Ä‘oÃ¡n vÃ  tÃ³m táº¯t ca lÃ¢m sÃ ng")
    public ResponseEntity<ApiResponse<String>> getAiClinicalSupport(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.getClinicalSupport(consultation)));
    }

    @PostMapping("/{id}/ai-chat")
    @Operation(summary = "Chat vá»›i AI Clinical Assistant vá» ca bá»‡nh")
    public ResponseEntity<ApiResponse<String>> aiClinicalChat(
            @PathVariable UUID id,
            @RequestBody AiChatRequest request) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(
                aiClinicalService.getClinicalChatResponse(consultation, request.getMessage(), request.getHistory())));
    }

    @PostMapping("/{id}/verify-prescription")
    @Operation(summary = "AI Kiá»ƒm tra Ä‘Æ¡n thuá»‘c")
    public ResponseEntity<ApiResponse<PrescriptionVerificationDto>> verifyPrescription(
            @PathVariable UUID id,
            @RequestBody List<PrescriptionItemDto> items) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.verifyPrescription(consultation, items)));
    }

    @GetMapping("/{id}/suggested-templates")
    @Operation(summary = "AI Gá»£i Ã½ phÃ¡c Ä‘á»“ Ä‘iá»u trá»‹ máº«u phÃ¹ há»£p vá»›i cháº©n Ä‘oÃ¡n")
    public ResponseEntity<ApiResponse<String>> getSuggestedTemplates(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        var templates = templateService.getTemplates();
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.suggestTemplates(consultation, templates)));
    }

    @PostMapping("/{id}/icd10-suggest")
    @Operation(summary = "Gá»£i Ã½ mÃ£ ICD-10 dá»±a trÃªn cháº©n Ä‘oÃ¡n")
    public ResponseEntity<ApiResponse<Icd10CodeDto>> suggestIcd10(
            @PathVariable UUID id,
            @RequestBody String diagnosis) {
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.suggestIcd10Code(diagnosis)));
    }

    @GetMapping("/{id}/differential-diagnosis")
    @Operation(summary = "Láº¥y gá»£i Ã½ cháº©n Ä‘oÃ¡n phÃ¢n biá»‡t tá»« AI")
    public ResponseEntity<ApiResponse<DifferentialDiagnosisDto>> getDifferentialDiagnosis(
            @PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.getDifferentialDiagnosis(consultation)));
    }

    @GetMapping("/{id}/clinical-checklist")
    @Operation(summary = "Láº¥y checklist thÄƒm khÃ¡m gá»£i Ã½ tá»« AI")
    public ResponseEntity<ApiResponse<ClinicalChecklistDto>> getClinicalChecklist(
            @PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.getSuggestedChecklist(consultation)));
    }

    @GetMapping("/{id}/care-plan")
    @Operation(summary = "AI Táº¡o káº¿ hoáº¡ch chÄƒm sÃ³c dÃ i háº¡n (Long-term Care Plan)")
    public ResponseEntity<ApiResponse<String>> getCarePlan(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.generateLongTermCarePlan(consultation)));
    }

    @GetMapping("/{id}/lab-interpretation")
    @Operation(summary = "AI phÃ¢n tÃ­ch vÃ  giáº£i thÃ­ch káº¿t quáº£ xÃ©t nghiá»‡m")
    public ResponseEntity<ApiResponse<String>> interpretLabResults(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.interpretLabResults(consultation)));
    }

    @GetMapping("/{id}/discharge-instructions")
    @Operation(summary = "AI táº¡o hÆ°á»›ng dáº«n xuáº¥t viá»‡n cho bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<String>> getDischargeInstructions(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.generateDischargeInstructions(consultation)));
    }

    @PostMapping("/{id}/cdm-report")
    @Operation(summary = "Xuáº¥t bÃ¡o cÃ¡o CDM (PDF)")
    public ResponseEntity<InputStreamResource> downloadCdmReport(
            @PathVariable UUID id,
            @RequestBody(required = false) String carePlan) {
        var consultation = clinicalService.getById(id);
        var reportData = contextService.getCdmReportData(consultation, carePlan);
        var bis = pdfService.generateCdmReportPdf(reportData);

        var headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=cdm-report-" + id + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @PostMapping("/{id}/cdm-report/send")
    @Operation(summary = "Gá»­i bÃ¡o cÃ¡o CDM cho bá»‡nh nhÃ¢n (Email & Push)")
    public ResponseEntity<ApiResponse<String>> sendCdmReport(
            @PathVariable UUID id,
            @RequestBody(required = false) String carePlan) {
        var consultation = clinicalService.getById(id);
        var patient = consultation.getPatient();

        if (patient.getEmail() == null || patient.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Bá»‡nh nhÃ¢n chÆ°a cÃ³ Ä‘á»‹a chá»‰ Email"));
        }

        var reportData = contextService.getCdmReportData(consultation, carePlan);
        var bis = pdfService.generateCdmReportPdf(reportData);
        byte[] pdfBytes = bis.readAllBytes();

        // 1. Gá»­i Email Ä‘Ã­nh kÃ¨m PDF
        String subject = "BÃ¡o cÃ¡o Quáº£n lÃ½ Sá»©c khá»e MÃ£n tÃ­nh - " + patient.getFullNameVi();
        String body = "<h3>Káº¿ hoáº¡ch ChÄƒm sÃ³c Sá»©c khá»e CÃ¡ nhÃ¢n hÃ³a</h3>" +
                "<p>ChÃ o báº¡n " + patient.getFullNameVi() + ",</p>" +
                "<p>Há»‡ thá»‘ng AI Healthcare xin gá»­i tá»›i báº¡n báº£n tÃ³m táº¯t káº¿ hoáº¡ch chÄƒm sÃ³c sá»©c khá»e dÃ i háº¡n dÃ nh riÃªng cho báº¡n.</p>"
                +
                "<p>Vui lÃ²ng xem chi tiáº¿t trong file Ä‘Ã­nh kÃ¨m.</p>";

        emailService.sendEmailWithAttachment(patient.getEmail(), subject, body, pdfBytes, "Bao-cao-CDM.pdf");

        // 2. Gá»­i Push Notification (náº¿u cÃ³ push token)
        // placeholder: find push token from user profile
        // notificationService.sendPushNotification(token, "Báº£n káº¿ hoáº¡ch CDM má»›i", "Há»‡
        // thá»‘ng AI vá»«a gá»­i káº¿ hoáº¡ch chÄƒm sÃ³c cho báº¡n.", null);

        return ResponseEntity.ok(ApiResponse.success("ÄÃ£ gá»­i bÃ¡o cÃ¡o thÃ nh cÃ´ng tá»›i " + patient.getEmail()));
    }

    @GetMapping("/{id}/follow-up-suggestion")
    @Operation(summary = "AI Gá»£i Ã½ thá»i Ä‘iá»ƒm tÃ¡i khÃ¡m dá»±a trÃªn tÃ¬nh tráº¡ng bá»‡nh")
    public ResponseEntity<ApiResponse<FollowUpSuggestionDto>> getFollowUpSuggestion(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.suggestFollowUp(consultation)));
    }

    @PostMapping("/reminders/{reminderId}/trigger")
    @Operation(summary = "Gá»­i nháº¯c nhá»Ÿ uá»‘ng thuá»‘c thá»§ cÃ´ng qua Ä‘a kÃªnh")
    public ResponseEntity<ApiResponse<String>> triggerMedicationReminder(@PathVariable UUID reminderId) {
        var reminder = reminderRepository.findById(reminderId)
                .orElseThrow(
                        () -> new vn.clinic.cdm.common.exception.ResourceNotFoundException("MedicationReminder",
                                reminderId));
        var patient = reminder.getPatient();

        omniChannelService.sendMedicationReminder(patient.getFullNameVi(), patient.getEmail(), patient.getPhone(),
                reminder.getMedicineName(), reminder.getDosage());

        return ResponseEntity.ok(ApiResponse.success("ÄÃ£ gá»­i nháº¯c nhá»Ÿ tá»›i bá»‡nh nhÃ¢n"));
    }

    @GetMapping("/{id}/treatment-efficacy")
    @Operation(summary = "AI PhÃ¢n tÃ­ch hiá»‡u quáº£ phÃ¡c Ä‘á»“ Ä‘iá»u trá»‹")
    public ResponseEntity<ApiResponse<TreatmentEfficacyDto>> getTreatmentEfficacy(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.analyzeTreatmentEfficacy(consultation)));
    }

    @GetMapping("/{id}/complication-risk")
    @Operation(summary = "AI Dá»± bÃ¡o nguy cÆ¡ biáº¿n chá»©ng bá»‡nh ná»n")
    public ResponseEntity<ApiResponse<ComplicationRiskDto>> getComplicationRisk(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.predictComplicationRisk(consultation)));
    }

    @GetMapping("/{id}/standardized-note")
    @Operation(summary = "AI Chuáº©n hÃ³a há»“ sÆ¡ SOAP & Gá»£i Ã½ mÃ£ Billing (CPT/ICD10)")
    public ResponseEntity<ApiResponse<StandardizedClinicalNoteDto>> getStandardizedClinicalNote(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.standardizeClinicalNote(consultation)));
    }
}

