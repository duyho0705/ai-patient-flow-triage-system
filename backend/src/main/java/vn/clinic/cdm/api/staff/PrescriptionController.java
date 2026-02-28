package vn.clinic.cdm.api.staff;

// Unused wildcard imports removed
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.medication.CreatePrescriptionRequest;
import vn.clinic.cdm.api.dto.medication.PrescriptionDto;
import vn.clinic.cdm.clinical.domain.Prescription;
import vn.clinic.cdm.clinical.service.ClinicalService;

import java.util.UUID;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescription", description = "Quáº£n lÃ½ Ä‘Æ¡n thuá»‘c CDM")
public class PrescriptionController {

    private final ClinicalService clinicalService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Táº¡o Ä‘Æ¡n thuá»‘c cho phiÃªn khÃ¡m")
    public ResponseEntity<ApiResponse<PrescriptionDto>> createPrescription(
            @jakarta.validation.Valid @RequestBody CreatePrescriptionRequest request) {
        Prescription p = clinicalService.createPrescription(request);
        return ResponseEntity.ok(ApiResponse.success(clinicalService.mapPrescriptionToDto(p)));
    }

    @GetMapping("/consultation/{id}")
    @Operation(summary = "Láº¥y Ä‘Æ¡n thuá»‘c theo phiÃªn khÃ¡m")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getByConsultation(@PathVariable UUID id) {
        return clinicalService.getPrescriptionByConsultation(id)
                .map(p -> ResponseEntity.ok(ApiResponse.success(clinicalService.mapPrescriptionToDto(p))))
                .orElse(ResponseEntity.notFound().build());
    }
}

