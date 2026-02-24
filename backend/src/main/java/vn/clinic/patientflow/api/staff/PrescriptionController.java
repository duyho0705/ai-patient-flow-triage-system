package vn.clinic.patientflow.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.CreatePrescriptionRequest;
import vn.clinic.patientflow.api.dto.PrescriptionDto;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.clinical.domain.Prescription;
import vn.clinic.patientflow.clinical.service.ClinicalService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescription", description = "Quản lý đơn thuốc")
public class PrescriptionController {

    private final ClinicalService clinicalService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Tạo đơn thuốc cho phiên khám")
    public ResponseEntity<ApiResponse<PrescriptionDto>> createPrescription(
            @jakarta.validation.Valid @RequestBody CreatePrescriptionRequest request) {
        Prescription p = clinicalService.createPrescription(request);
        return ResponseEntity.ok(ApiResponse.success(clinicalService.mapPrescriptionToDto(p)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    @Operation(summary = "Lấy danh sách đơn thuốc chờ cấp phát")
    public ResponseEntity<ApiResponse<List<PrescriptionDto>>> getPendingPrescriptions(@RequestParam UUID branchId) {
        var list = clinicalService.getPendingPrescriptions(branchId);
        var data = list.stream().map(clinicalService::mapPrescriptionToDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/{id}/dispense")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    @Operation(summary = "Xác nhận đã cấp phát thuốc (Trừ kho)")
    public ResponseEntity<ApiResponse<Void>> dispensePrescription(@PathVariable UUID id) {
        clinicalService.dispensePrescription(id, AuthPrincipal.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
