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
import vn.clinic.patientflow.clinical.domain.Prescription;
import vn.clinic.patientflow.clinical.service.ClinicalService;

import java.util.UUID;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescription", description = "Quản lý đơn thuốc CDM")
public class PrescriptionController {

    private final ClinicalService clinicalService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Tạo đơn thuốc cho phiên khám")
    public ResponseEntity<ApiResponse<PrescriptionDto>> createPrescription(
            @jakarta.validation.Valid @RequestBody CreatePrescriptionRequest request) {
        Prescription p = clinicalService.createPrescription(request);
        return ResponseEntity.ok(ApiResponse.success(clinicalService.mapPrescriptionToDto(p)));
    }

    @GetMapping("/consultation/{id}")
    @Operation(summary = "Lấy đơn thuốc theo phiên khám")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getByConsultation(@PathVariable UUID id) {
        return clinicalService.getPrescriptionByConsultation(id)
                .map(p -> ResponseEntity.ok(ApiResponse.success(clinicalService.mapPrescriptionToDto(p))))
                .orElse(ResponseEntity.notFound().build());
    }
}
