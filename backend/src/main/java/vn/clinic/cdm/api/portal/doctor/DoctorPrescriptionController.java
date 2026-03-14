package vn.clinic.cdm.api.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.common.PagedResponse;
import vn.clinic.cdm.api.dto.medication.PrescriptionDto;
import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.clinical.domain.Prescription;
import vn.clinic.cdm.clinical.service.ClinicalService;
import vn.clinic.cdm.clinical.service.DoctorPrescriptionService;

import vn.clinic.cdm.common.service.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayInputStream;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Quản lý Đơn thuốc Điện tử — Doctor Portal.
 * <p>
 * Bác sĩ có thể:
 * - Xem danh sách đơn thuốc đã kê (phân trang)
 * - Xem chi tiết đơn thuốc
 * - Cập nhật đơn thuốc (diagnosis, notes)
 * - Đổi trạng thái đơn thuốc (ISSUED → DISPENSED, DRAFT → ISSUED, etc.)
 */
@RestController
@RequestMapping("/api/doctor-portal/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Doctor Prescriptions", description = "Quản lý đơn thuốc điện tử dành cho bác sĩ")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorPrescriptionController {

    private final DoctorPrescriptionService doctorPrescriptionService;
    private final ClinicalService clinicalService;
    private final PdfService pdfService;

    @GetMapping
    @Operation(summary = "Danh sách đơn thuốc điện tử do bác sĩ kê (phân trang)")
    public ResponseEntity<ApiResponse<PagedResponse<PrescriptionDto>>> getMyPrescriptions(
            @PageableDefault(size = 20) Pageable pageable) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Page<Prescription> page = doctorPrescriptionService.getMyPrescriptions(doctorUserId, pageable);

        var data = PagedResponse.of(page,
                page.getContent().stream()
                        .map(this::toDto)
                        .collect(Collectors.toList()));

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết đơn thuốc điện tử")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getPrescriptionById(@PathVariable UUID id) {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Prescription p = doctorPrescriptionService.getPrescriptionById(id, doctorUserId);
        return ResponseEntity.ok(ApiResponse.success(toDto(p)));
    }

    @PostMapping
    @Operation(summary = "Tạo đơn thuốc mới")
    public ResponseEntity<ApiResponse<PrescriptionDto>> createPrescription(
            @jakarta.validation.Valid @RequestBody vn.clinic.cdm.api.dto.medication.CreatePrescriptionRequest request) {
        Prescription p = clinicalService.createPrescription(request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.success(toDto(p)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật đơn thuốc điện tử (chẩn đoán, ghi chú)")
    public ResponseEntity<ApiResponse<PrescriptionDto>> updatePrescription(
            @PathVariable UUID id,
            @RequestBody UpdatePrescriptionRequest request) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Prescription updated = doctorPrescriptionService
                .updatePrescription(id, doctorUserId, request.diagnosis, request.notes);
        return ResponseEntity.ok(ApiResponse.success(toDto(updated)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Đổi trạng thái đơn thuốc điện tử")
    public ResponseEntity<ApiResponse<PrescriptionDto>> updatePrescriptionStatus(
            @PathVariable UUID id,
            @RequestParam String status) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Prescription.PrescriptionStatus newStatus = Prescription.PrescriptionStatus.valueOf(status.toUpperCase());
        Prescription updated = doctorPrescriptionService.updatePrescriptionStatus(id, doctorUserId, newStatus);
        return ResponseEntity.ok(ApiResponse.success(toDto(updated)));
    }

    @GetMapping("/{id}/export-pdf")
    @Operation(summary = "Xuất đơn thuốc (PDF)")
    public ResponseEntity<byte[]> exportPrescriptionPdf(@PathVariable UUID id) {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Prescription p = doctorPrescriptionService.getPrescriptionById(id, doctorUserId);
        PrescriptionDto dto = toDto(p);

        ByteArrayInputStream bis = pdfService.generatePrescriptionPdf(dto);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=prescription_" + id.toString().substring(0, 8) + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(bis.readAllBytes());
    }

    private PrescriptionDto toDto(Prescription p) {
        return clinicalService.mapPrescriptionToDto(p);
    }

    // ─── Inner Request DTO ───────────────────────
    record UpdatePrescriptionRequest(String diagnosis, String notes) {
    }
}
