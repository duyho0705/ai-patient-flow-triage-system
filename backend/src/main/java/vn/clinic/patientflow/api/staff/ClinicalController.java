package vn.clinic.patientflow.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.clinical.service.CdsService;
import vn.clinic.patientflow.clinical.service.ClinicalService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/clinical/consultations", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Clinical", description = "Quản lý khám bệnh")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class ClinicalController {

    private final ClinicalService clinicalService;
    private final CdsService cdsService;
    private final vn.clinic.patientflow.clinical.service.EarlyWarningService earlyWarningService;

    @GetMapping("/{id}/early-warning")
    @Operation(summary = "Cảnh báo sớm & Theo dõi chỉ số bệnh mãn tính AI")
    public ResponseEntity<ApiResponse<ClinicalEarlyWarningDto>> getEarlyWarning(@PathVariable UUID id) {
        return ResponseEntity
                .ok(ApiResponse.success(earlyWarningService.calculateEarlyWarning(clinicalService.getById(id))));
    }

    @GetMapping("/{id}/cds-advice")
    @Operation(summary = "Hỗ trợ quyết định lâm sàng (Enterprise CDS)")
    public ResponseEntity<ApiResponse<CdsAdviceDto>> getCdsAdvice(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(cdsService.getCdsAdvice(clinicalService.getById(id))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin phiếu khám")
    public ResponseEntity<ApiResponse<ConsultationDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(ConsultationDto.fromEntity(clinicalService.getById(id))));
    }

    @GetMapping("/history")
    @Operation(summary = "Lịch sử khám bệnh của bệnh nhân")
    public ResponseEntity<ApiResponse<List<ConsultationDto>>> getHistory(@RequestParam UUID patientId) {
        var data = clinicalService.getPatientHistory(patientId).stream()
                .map(ConsultationDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}/vitals")
    @Operation(summary = "Lấy sinh hiệu của phiên khám")
    public ResponseEntity<ApiResponse<List<TriageVitalDto>>> getVitals(@PathVariable UUID id) {
        var data = clinicalService.getVitals(id).stream()
                .map(v -> new TriageVitalDto(
                        v.getId(),
                        v.getVitalType(),
                        v.getValueNumeric(),
                        v.getUnit(),
                        v.getRecordedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Bắt đầu phiên khám từ hàng chờ")
    public ResponseEntity<ApiResponse<ConsultationDto>> startConsultation(
            @RequestBody CreateConsultationRequest request,
            @AuthenticationPrincipal AuthPrincipal principal) {

        UUID doctorId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                ConsultationDto.fromEntity(clinicalService.startConsultation(request.getQueueEntryId(), doctorId))));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Cập nhật ghi chú thăm khám")
    public ResponseEntity<ApiResponse<ConsultationDto>> updateConsultation(
            @PathVariable UUID id,
            @RequestBody CreateConsultationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(ConsultationDto.fromEntity(
                clinicalService.updateConsultation(id, request.getDiagnosisNotes(), request.getPrescriptionNotes()))));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Hoàn tất phiên khám")
    public ResponseEntity<ApiResponse<ConsultationDto>> completeConsultation(@PathVariable UUID id) {
        return ResponseEntity
                .ok(ApiResponse.success(ConsultationDto.fromEntity(clinicalService.completeConsultation(id))));
    }

    @PostMapping("/prescriptions")
    @Operation(summary = "Tạo đơn thuốc")
    public ResponseEntity<ApiResponse<vn.clinic.patientflow.clinical.domain.Prescription>> createPrescription(
            @RequestBody vn.clinic.patientflow.api.dto.CreatePrescriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(clinicalService.createPrescription(request)));
    }
}
