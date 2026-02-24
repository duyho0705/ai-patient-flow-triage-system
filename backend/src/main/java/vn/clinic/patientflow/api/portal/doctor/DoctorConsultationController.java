package vn.clinic.patientflow.api.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.clinical.service.CdsService;
import vn.clinic.patientflow.clinical.service.ClinicalService;
import vn.clinic.patientflow.clinical.service.EarlyWarningService;
import vn.clinic.patientflow.common.service.PdfService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor-portal/consultations")
@RequiredArgsConstructor
@Tag(name = "Doctor Consultation", description = "Quản lý ca khám bệnh dành cho bác sĩ")
@Slf4j
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorConsultationController {

    private final ClinicalService clinicalService;
    private final CdsService cdsService;
    private final EarlyWarningService earlyWarningService;
    private final PdfService pdfService;

    @GetMapping("/{id}/cds-advice")
    @Operation(summary = "Hỗ trợ quyết định lâm sàng (Enterprise CDS)")
    public ResponseEntity<ApiResponse<CdsAdviceDto>> getCdsAdvice(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(cdsService.getCdsAdvice(consultation)));
    }

    @GetMapping("/{id}/early-warning")
    @Operation(summary = "Hệ thống cảnh báo sớm (NEWS2 Monitor)")
    public ResponseEntity<ApiResponse<ClinicalEarlyWarningDto>> getEarlyWarning(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(earlyWarningService.calculateEarlyWarning(consultation)));
    }

    @PostMapping("/{id}/diagnostic-images/order")
    @Operation(summary = "Chỉ định chụp X-Quang/Siêu âm")
    public ResponseEntity<ApiResponse<Void>> orderDiagnosticImage(
            @PathVariable UUID id,
            @RequestBody String title) {
        clinicalService.orderDiagnosticImage(id, title);
        log.info("Doctor ordered diagnostic image: {} for consultation {}", title, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/lab-results")
    @Operation(summary = "Lấy kết quả xét nghiệm của ca khám")
    public ResponseEntity<ApiResponse<List<LabResultDto>>> getLabResults(@PathVariable UUID id) {
        var data = clinicalService.getLabResults(id).stream()
                .map(LabResultDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}/diagnostic-images")
    @Operation(summary = "Lấy hình ảnh chẩn đoán của ca khám")
    public ResponseEntity<ApiResponse<List<DiagnosticImageDto>>> getDiagnosticImages(@PathVariable UUID id) {
        var data = clinicalService.getDiagnosticImages(id).stream()
                .map(DiagnosticImageDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Xuất PDF đơn thuốc và tóm tắt ca khám")
    public ResponseEntity<InputStreamResource> exportPdf(@PathVariable UUID id) {
        var summary = clinicalService.getConsultationSummaryForPdf(id);
        var bis = pdfService.generateConsultationSummaryPdf(summary);

        var headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=consultation_summary_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
