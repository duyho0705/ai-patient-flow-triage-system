package vn.clinic.cdm.api.portal.doctor;

import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.ai.CdsAdviceDto;
import vn.clinic.cdm.api.dto.ai.ClinicalEarlyWarningDto;
import vn.clinic.cdm.api.dto.clinical.LabResultDto;
import vn.clinic.cdm.api.dto.clinical.DiagnosticImageDto;
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

import vn.clinic.cdm.clinical.service.CdsService;
import vn.clinic.cdm.clinical.service.ClinicalService;
import vn.clinic.cdm.clinical.service.EarlyWarningService;
import vn.clinic.cdm.common.service.PdfService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor-portal/consultations")
@RequiredArgsConstructor
@Tag(name = "Doctor Consultation", description = "Quáº£n lÃ½ ca khÃ¡m bá»‡nh dÃ nh cho bÃ¡c sÄ©")
@Slf4j
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorConsultationController {

    private final ClinicalService clinicalService;
    private final CdsService cdsService;
    private final EarlyWarningService earlyWarningService;
    private final PdfService pdfService;

    @GetMapping("/{id}/cds-advice")
    @Operation(summary = "Há»— trá»£ quyáº¿t Ä‘á»‹nh lÃ¢m sÃ ng (Enterprise CDS)")
    public ResponseEntity<ApiResponse<CdsAdviceDto>> getCdsAdvice(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(cdsService.getCdsAdvice(consultation)));
    }

    @GetMapping("/{id}/early-warning")
    @Operation(summary = "Há»‡ thá»‘ng cáº£nh bÃ¡o sá»›m (NEWS2 Monitor)")
    public ResponseEntity<ApiResponse<ClinicalEarlyWarningDto>> getEarlyWarning(@PathVariable UUID id) {
        var consultation = clinicalService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(earlyWarningService.calculateEarlyWarning(consultation)));
    }

    @PostMapping("/{id}/diagnostic-images/order")
    @Operation(summary = "Chá»‰ Ä‘á»‹nh chá»¥p X-Quang/SiÃªu Ã¢m")
    public ResponseEntity<ApiResponse<Void>> orderDiagnosticImage(
            @PathVariable UUID id,
            @RequestBody String title) {
        clinicalService.orderDiagnosticImage(id, title);
        log.info("Doctor ordered diagnostic image: {} for consultation {}", title, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/lab-results")
    @Operation(summary = "Láº¥y káº¿t quáº£ xÃ©t nghiá»‡m cá»§a ca khÃ¡m")
    public ResponseEntity<ApiResponse<List<LabResultDto>>> getLabResults(@PathVariable UUID id) {
        var data = clinicalService.getLabResults(id).stream()
                .map(LabResultDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}/diagnostic-images")
    @Operation(summary = "Láº¥y hÃ¬nh áº£nh cháº©n Ä‘oÃ¡n cá»§a ca khÃ¡m")
    public ResponseEntity<ApiResponse<List<DiagnosticImageDto>>> getDiagnosticImages(@PathVariable UUID id) {
        var data = clinicalService.getDiagnosticImages(id).stream()
                .map(DiagnosticImageDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Xuáº¥t PDF Ä‘Æ¡n thuá»‘c vÃ  tÃ³m táº¯t ca khÃ¡m")
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

