package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.RegisterDeviceTokenRequest;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.domain.PatientDeviceToken;
import vn.clinic.patientflow.patient.repository.PatientDeviceTokenRepository;
import vn.clinic.patientflow.patient.service.PatientService;

import java.util.UUID;
import java.time.Instant;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patient Notification", description = "Quản lý thông báo bệnh nhân")
public class PatientNotificationController {

    private final PatientDeviceTokenRepository deviceTokenRepository;
    private final PatientService patientService;

    @PostMapping("/{id}/device-tokens")
    @Operation(summary = "Đăng ký FCM token cho bệnh nhân")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')") // For now, staff registers for patient, or patient self if
                                                         // auth matches
    public ResponseEntity<Void> registerToken(
            @PathVariable UUID id,
            @Valid @RequestBody RegisterDeviceTokenRequest request) {

        Patient patient = patientService.getById(id);

        // Remove old token if exists to maintain uniqueness
        deviceTokenRepository.deleteByFcmToken(request.getFcmToken());

        PatientDeviceToken token = PatientDeviceToken.builder()
                .patient(patient)
                .fcmToken(request.getFcmToken())
                .deviceType(request.getDeviceType())
                .lastSeenAt(Instant.now())
                .build();

        deviceTokenRepository.save(token);
        return ResponseEntity.ok().build();
    }
}
