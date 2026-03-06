package vn.clinic.cdm.api.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorPrescriptionController {

    private final DoctorPrescriptionService doctorPrescriptionService;
    private final ClinicalService clinicalService;

    @GetMapping
    @Operation(summary = "Danh sách đơn thuốc điện tử do bác sĩ kê (phân trang)")
    public ResponseEntity<ApiResponse<PagedResponse<PrescriptionDto>>> getMyPrescriptions(
            @PageableDefault(size = 20) Pageable pageable) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Page<Prescription> page = doctorPrescriptionService.getMyPrescriptions(doctorUserId, pageable);

        var data = PagedResponse.of(page,
                page.getContent().stream()
                        .map(clinicalService::mapPrescriptionToDto)
                        .collect(Collectors.toList()));

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết đơn thuốc điện tử")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getPrescriptionById(@PathVariable UUID id) {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Prescription p = doctorPrescriptionService.getPrescriptionById(id, doctorUserId);
        return ResponseEntity.ok(ApiResponse.success(clinicalService.mapPrescriptionToDto(p)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật đơn thuốc điện tử (chẩn đoán, ghi chú)")
    public ResponseEntity<ApiResponse<PrescriptionDto>> updatePrescription(
            @PathVariable UUID id,
            @RequestBody UpdatePrescriptionRequest request) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Prescription updated = doctorPrescriptionService
                .updatePrescription(id, doctorUserId, request.diagnosis, request.notes);
        return ResponseEntity.ok(ApiResponse.success(clinicalService.mapPrescriptionToDto(updated)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Đổi trạng thái đơn thuốc điện tử")
    public ResponseEntity<ApiResponse<PrescriptionDto>> updatePrescriptionStatus(
            @PathVariable UUID id,
            @RequestParam String status) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Prescription.PrescriptionStatus newStatus = Prescription.PrescriptionStatus.valueOf(status.toUpperCase());
        Prescription updated = doctorPrescriptionService.updatePrescriptionStatus(id, doctorUserId, newStatus);
        return ResponseEntity.ok(ApiResponse.success(clinicalService.mapPrescriptionToDto(updated)));
    }

    // ─── Inner Request DTO ───────────────────────
    record UpdatePrescriptionRequest(String diagnosis, String notes) {
    }
}
