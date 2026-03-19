package vn.clinic.cdm.controller.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.dto.common.PagedResponse;
import vn.clinic.cdm.dto.medication.PrescriptionDto;
import vn.clinic.cdm.security.AuthPrincipal;
import vn.clinic.cdm.entity.clinical.Prescription;
import vn.clinic.cdm.service.clinical.ClinicalService;
import vn.clinic.cdm.service.clinical.DoctorPrescriptionService;

import vn.clinic.cdm.service.common.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayInputStream;
import java.util.UUID;


/**
 * Quản lý Đơn thuốc Điện tử — Doctor Portal.
 */
@RestController
@RequestMapping("/api/doctor-portal/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Doctor Prescriptions", description = "Quản lý đơn thuốc điện tử dành cho bác sĩ")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorPrescriptionController {

    private final DoctorPrescriptionService doctorPrescriptionService;
    private final ClinicalService clinicalService;
    private final PdfService pdfService;

    @GetMapping
    @Operation(summary = "Danh sách đơn thuốc điện tử do bác sĩ kê (phân trang)")
    public ResponseEntity<ApiResponse<PagedResponse<PrescriptionDto>>> getMyPrescriptions(
            @PageableDefault(size = 20) Pageable pageable) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Page<PrescriptionDto> page = doctorPrescriptionService.getMyPrescriptions(doctorUserId, pageable);

        var data = PagedResponse.of(page);

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết đơn thuốc điện tử")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getPrescriptionById(@PathVariable UUID id) {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        PrescriptionDto dto = doctorPrescriptionService.getPrescriptionById(doctorUserId, id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    @Operation(summary = "Tạo đơn thuốc mới")
    public ResponseEntity<ApiResponse<PrescriptionDto>> createPrescription(
            @jakarta.validation.Valid @RequestBody vn.clinic.cdm.dto.medication.CreatePrescriptionRequest request) {
        Prescription p = clinicalService.createPrescription(request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.success(clinicalService.mapPrescriptionToDto(p)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật đơn thuốc điện tử (chẩn đoán, ghi chú)")
    public ResponseEntity<ApiResponse<PrescriptionDto>> updatePrescription(
            @PathVariable UUID id,
            @RequestBody UpdatePrescriptionRequest request) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        PrescriptionDto updated = doctorPrescriptionService
                .updatePrescription(doctorUserId, id, request.diagnosis, request.notes);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Đổi trạng thái đơn thuốc điện tử")
    public ResponseEntity<ApiResponse<PrescriptionDto>> updatePrescriptionStatus(
            @PathVariable UUID id,
            @RequestParam String status) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Prescription.PrescriptionStatus newStatus = Prescription.PrescriptionStatus.valueOf(status.toUpperCase());
        PrescriptionDto updated = doctorPrescriptionService.updatePrescriptionStatus(doctorUserId, id, newStatus);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @GetMapping("/{id}/export-pdf")
    @Operation(summary = "Xuất đơn thuốc (PDF)")
    public ResponseEntity<byte[]> exportPrescriptionPdf(@PathVariable UUID id) {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        PrescriptionDto dto = doctorPrescriptionService.getPrescriptionById(doctorUserId, id);

        ByteArrayInputStream bis = pdfService.generatePrescriptionPdf(dto);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=prescription_" + id.toString().substring(0, 8) + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(bis.readAllBytes());
    }

    // ─── Inner Request DTO ───────────────────────
    record UpdatePrescriptionRequest(String diagnosis, String notes) {
    }
}
