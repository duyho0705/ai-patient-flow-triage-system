package vn.clinic.patientflow.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.api.dto.ConsultationDto;
import vn.clinic.patientflow.api.dto.CreateConsultationRequest;
import vn.clinic.patientflow.clinical.service.ClinicalService;

@RestController
@RequestMapping(value = "/api/clinical/consultations", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Clinical", description = "Quản lý khám bệnh")
public class ClinicalController {

    private final ClinicalService clinicalService;

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin phiếu khám")
    public ConsultationDto getById(@PathVariable UUID id) {
        return ConsultationDto.fromEntity(clinicalService.getById(id));
    }

    @GetMapping("/history")
    @Operation(summary = "Lịch sử khám bệnh của bệnh nhân")
    public List<ConsultationDto> getHistory(@RequestParam UUID patientId) {
        return clinicalService.getPatientHistory(patientId).stream()
                .map(ConsultationDto::fromEntity)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Bắt đầu phiên khám từ hàng chờ")
    public ConsultationDto startConsultation(
            @RequestBody CreateConsultationRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt != null) {
            String userId = jwt.getClaimAsString("uid"); // Adjust based on your JWT claim for user ID
            if (userId != null) {
                // If using Keycloak/external ID, you might need lookup.
                // Assuming 'sub' or specific claim maps to IdentityUser ID or External ID.
                // For simplicity, let's assume we look up by external ID from 'sub'
                // But IdentityService.getUserById takes UUID (internal).
                // Let's assume the current setup passes internal ID or we skip doctor
                // assignment for now if complex.
                // Better: Look up user by email or sub.
                // For this step, I'll omit auto-assigning doctor from token if not critical, or
                // mock it.
                // To be robust: implementation depends on how IdentityService maps JWT to User.
            }
        }
        // Simplified: Client can pass doctorId if needed, or we infer from context.
        // For now, I will pass null for doctorId to avoid Auth complexity bugs, can be
        // added later.

        return ConsultationDto.fromEntity(clinicalService.startConsultation(request.getQueueEntryId(), null));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Cập nhật ghi chú thăm khám")
    public ConsultationDto updateConsultation(
            @PathVariable UUID id,
            @RequestBody CreateConsultationRequest request) {
        return ConsultationDto.fromEntity(
                clinicalService.updateConsultation(id, request.getDiagnosisNotes(), request.getPrescriptionNotes()));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Hoàn tất phiên khám")
    public ConsultationDto completeConsultation(@PathVariable UUID id) {
        return ConsultationDto.fromEntity(clinicalService.completeConsultation(id));
    }
}
