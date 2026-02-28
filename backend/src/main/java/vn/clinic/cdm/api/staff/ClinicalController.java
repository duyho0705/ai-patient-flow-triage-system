package vn.clinic.cdm.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.clinical.service.CdsService;
import vn.clinic.cdm.clinical.service.ClinicalService;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.ai.ClinicalEarlyWarningDto;
import vn.clinic.cdm.api.dto.ai.CdsAdviceDto;
import vn.clinic.cdm.api.dto.clinical.ConsultationDto;
import vn.clinic.cdm.api.dto.clinical.TriageVitalDto;
import vn.clinic.cdm.api.dto.clinical.CreateConsultationRequest;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/clinical/consultations", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Clinical", description = "Quáº£n lÃ½ khÃ¡m bá»‡nh")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class ClinicalController {

    private final ClinicalService clinicalService;
    private final CdsService cdsService;
    private final vn.clinic.cdm.clinical.service.EarlyWarningService earlyWarningService;

    @GetMapping("/{id}/early-warning")
    @Operation(summary = "Cáº£nh bÃ¡o sá»›m & Theo dÃµi chá»‰ sá»‘ bá»‡nh mÃ£n tÃ­nh AI")
    public ResponseEntity<ApiResponse<ClinicalEarlyWarningDto>> getEarlyWarning(@PathVariable UUID id) {
        return ResponseEntity
                .ok(ApiResponse.success(earlyWarningService.calculateEarlyWarning(clinicalService.getById(id))));
    }

    @GetMapping("/{id}/cds-advice")
    @Operation(summary = "Há»— trá»£ quyáº¿t Ä‘á»‹nh lÃ¢m sÃ ng (Enterprise CDS)")
    public ResponseEntity<ApiResponse<CdsAdviceDto>> getCdsAdvice(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(cdsService.getCdsAdvice(clinicalService.getById(id))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Láº¥y thÃ´ng tin phiáº¿u khÃ¡m")
    public ResponseEntity<ApiResponse<ConsultationDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(ConsultationDto.fromEntity(clinicalService.getById(id))));
    }

    @GetMapping("/history")
    @Operation(summary = "Lá»‹ch sá»­ khÃ¡m bá»‡nh cá»§a bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<List<ConsultationDto>>> getHistory(@RequestParam UUID patientId) {
        var data = clinicalService.getPatientHistory(patientId).stream()
                .map(ConsultationDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}/vitals")
    @Operation(summary = "Láº¥y sinh hiá»‡u cá»§a phiÃªn khÃ¡m")
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
    @Operation(summary = "Báº¯t Ä‘áº§u phiÃªn khÃ¡m tá»« hÃ ng chá»")
    public ResponseEntity<ApiResponse<ConsultationDto>> startConsultation(
            @RequestBody CreateConsultationRequest request,
            @AuthenticationPrincipal AuthPrincipal principal) {

        UUID doctorId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                ConsultationDto.fromEntity(clinicalService.startConsultation(request.getPatientId(), doctorId))));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Cáº­p nháº­t ghi chÃº thÄƒm khÃ¡m")
    public ResponseEntity<ApiResponse<ConsultationDto>> updateConsultation(
            @PathVariable UUID id,
            @RequestBody CreateConsultationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(ConsultationDto.fromEntity(
                clinicalService.updateConsultation(id, request.getDiagnosisNotes(), request.getPrescriptionNotes()))));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "HoÃ n táº¥t phiÃªn khÃ¡m")
    public ResponseEntity<ApiResponse<ConsultationDto>> completeConsultation(@PathVariable UUID id) {
        return ResponseEntity
                .ok(ApiResponse.success(ConsultationDto.fromEntity(clinicalService.completeConsultation(id))));
    }

    @PostMapping("/prescriptions")
    @Operation(summary = "Táº¡o Ä‘Æ¡n thuá»‘c")
    public ResponseEntity<ApiResponse<vn.clinic.cdm.clinical.domain.Prescription>> createPrescription(
            @RequestBody vn.clinic.cdm.api.dto.medication.CreatePrescriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(clinicalService.createPrescription(request)));
    }
}

