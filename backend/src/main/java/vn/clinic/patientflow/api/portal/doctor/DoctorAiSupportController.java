package vn.clinic.patientflow.api.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.clinical.service.AiClinicalService;
import vn.clinic.patientflow.clinical.service.ClinicalContextService;
import vn.clinic.patientflow.clinical.service.ClinicalService;
import vn.clinic.patientflow.clinical.service.PrescriptionTemplateService;
import vn.clinic.patientflow.common.service.PdfService;
import vn.clinic.patientflow.common.service.EmailService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor-portal/ai-support")
@RequiredArgsConstructor
@Tag(name = "Doctor AI Support", description = "Công cụ AI hỗ trợ bác sĩ lâm sàng")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorAiSupportController {

    private final ClinicalService clinicalService;
    private final AiClinicalService aiClinicalService;
    private final PrescriptionTemplateService templateService;
    private final PdfService pdfService;
    private final ClinicalContextService contextService;
    private final EmailService emailService;
    private final vn.clinic.patientflow.common.service.OmniChannelService omniChannelService;
    private final vn.clinic.patientflow.patient.repository.MedicationReminderRepository reminderRepository;

    @PostMapping("/{id}/ai-clinical-support")
    @Operation(summary = "AI Hỗ trợ chẩn đoán và tóm tắt ca lâm sàng")
    public ResponseEntity<ApiResponse<String>> getAiClinicalSupport(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.getClinicalSupport(consultation)));
    }

    @PostMapping("/{id}/ai-chat")
    @Operation(summary = "Chat với AI Clinical Assistant về ca bệnh")
    public ResponseEntity<ApiResponse<String>> aiClinicalChat(
            @PathVariable UUID id,
            @RequestBody AiChatRequest request) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(
                aiClinicalService.getClinicalChatResponse(consultation, request.getMessage(), request.getHistory())));
    }

    @PostMapping("/{id}/verify-prescription")
    @Operation(summary = "AI Kiểm tra đơn thuốc")
    public ResponseEntity<ApiResponse<PrescriptionVerificationDto>> verifyPrescription(
            @PathVariable UUID id,
            @RequestBody List<PrescriptionItemDto> items) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.verifyPrescription(consultation, items)));
    }

    @GetMapping("/{id}/suggested-templates")
    @Operation(summary = "AI Gợi ý phác đồ điều trị mẫu phù hợp với chẩn đoán")
    public ResponseEntity<ApiResponse<String>> getSuggestedTemplates(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        var templates = templateService.getTemplates();
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.suggestTemplates(consultation, templates)));
    }

    @PostMapping("/{id}/icd10-suggest")
    @Operation(summary = "Gợi ý mã ICD-10 dựa trên chẩn đoán")
    public ResponseEntity<ApiResponse<Icd10CodeDto>> suggestIcd10(
            @PathVariable UUID id,
            @RequestBody String diagnosis) {
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.suggestIcd10Code(diagnosis)));
    }

    @GetMapping("/{id}/differential-diagnosis")
    @Operation(summary = "Lấy gợi ý chẩn đoán phân biệt từ AI")
    public ResponseEntity<ApiResponse<DifferentialDiagnosisDto>> getDifferentialDiagnosis(
            @PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.getDifferentialDiagnosis(consultation)));
    }

    @GetMapping("/{id}/clinical-checklist")
    @Operation(summary = "Lấy checklist thăm khám gợi ý từ AI")
    public ResponseEntity<ApiResponse<ClinicalChecklistDto>> getClinicalChecklist(
            @PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.getSuggestedChecklist(consultation)));
    }

    @GetMapping("/{id}/care-plan")
    @Operation(summary = "AI Tạo kế hoạch chăm sóc dài hạn (Long-term Care Plan)")
    public ResponseEntity<ApiResponse<String>> getCarePlan(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.generateLongTermCarePlan(consultation)));
    }

    @GetMapping("/{id}/lab-interpretation")
    @Operation(summary = "AI phân tích và giải thích kết quả xét nghiệm")
    public ResponseEntity<ApiResponse<String>> interpretLabResults(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.interpretLabResults(consultation)));
    }

    @GetMapping("/{id}/discharge-instructions")
    @Operation(summary = "AI tạo hướng dẫn xuất viện cho bệnh nhân")
    public ResponseEntity<ApiResponse<String>> getDischargeInstructions(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.generateDischargeInstructions(consultation)));
    }

    @PostMapping("/{id}/cdm-report")
    @Operation(summary = "Xuất báo cáo CDM (PDF)")
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
    @Operation(summary = "Gửi báo cáo CDM cho bệnh nhân (Email & Push)")
    public ResponseEntity<ApiResponse<String>> sendCdmReport(
            @PathVariable UUID id,
            @RequestBody(required = false) String carePlan) {
        var consultation = clinicalService.getById(id);
        var patient = consultation.getPatient();

        if (patient.getEmail() == null || patient.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Bệnh nhân chưa có địa chỉ Email"));
        }

        var reportData = contextService.getCdmReportData(consultation, carePlan);
        var bis = pdfService.generateCdmReportPdf(reportData);
        byte[] pdfBytes = bis.readAllBytes();

        // 1. Gửi Email đính kèm PDF
        String subject = "Báo cáo Quản lý Sức khỏe Mãn tính - " + patient.getFullNameVi();
        String body = "<h3>Kế hoạch Chăm sóc Sức khỏe Cá nhân hóa</h3>" +
                "<p>Chào bạn " + patient.getFullNameVi() + ",</p>" +
                "<p>Hệ thống AI Healthcare xin gửi tới bạn bản tóm tắt kế hoạch chăm sóc sức khỏe dài hạn dành riêng cho bạn.</p>"
                +
                "<p>Vui lòng xem chi tiết trong file đính kèm.</p>";

        emailService.sendEmailWithAttachment(patient.getEmail(), subject, body, pdfBytes, "Bao-cao-CDM.pdf");

        // 2. Gửi Push Notification (nếu có push token)
        // placeholder: find push token from user profile
        // notificationService.sendPushNotification(token, "Bản kế hoạch CDM mới", "Hệ
        // thống AI vừa gửi kế hoạch chăm sóc cho bạn.", null);

        return ResponseEntity.ok(ApiResponse.success("Đã gửi báo cáo thành công tới " + patient.getEmail()));
    }

    @GetMapping("/{id}/follow-up-suggestion")
    @Operation(summary = "AI Gợi ý thời điểm tái khám dựa trên tình trạng bệnh")
    public ResponseEntity<ApiResponse<FollowUpSuggestionDto>> getFollowUpSuggestion(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.suggestFollowUp(consultation)));
    }

    @PostMapping("/reminders/{reminderId}/trigger")
    @Operation(summary = "Gửi nhắc nhở uống thuốc thủ công qua đa kênh")
    public ResponseEntity<ApiResponse<String>> triggerMedicationReminder(@PathVariable UUID reminderId) {
        var reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new vn.clinic.patientflow.common.exception.ResourceNotFoundException("Reminder",
                        reminderId));
        var p = reminder.getPatient();

        omniChannelService.sendMedicationReminder(p.getFullNameVi(), p.getEmail(), p.getPhone(),
                reminder.getMedicineName(), reminder.getDosage());

        return ResponseEntity.ok(ApiResponse.success("Đã gửi nhắc nhở tới bệnh nhân"));
    }

    @GetMapping("/{id}/treatment-efficacy")
    @Operation(summary = "AI Phân tích hiệu quả phác đồ điều trị")
    public ResponseEntity<ApiResponse<TreatmentEfficacyDto>> getTreatmentEfficacy(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.analyzeTreatmentEfficacy(consultation)));
    }

    @GetMapping("/{id}/complication-risk")
    @Operation(summary = "AI Dự báo nguy cơ biến chứng bệnh nền")
    public ResponseEntity<ApiResponse<ComplicationRiskDto>> getComplicationRisk(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.predictComplicationRisk(consultation)));
    }

    @GetMapping("/{id}/standardized-note")
    @Operation(summary = "AI Chuẩn hóa hồ sơ SOAP & Gợi ý mã Billing (CPT/ICD10)")
    public ResponseEntity<ApiResponse<StandardizedClinicalNoteDto>> getStandardizedClinicalNote(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.standardizeClinicalNote(consultation)));
    }
}
