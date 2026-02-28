package vn.clinic.cdm.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.messaging.PatientNotificationDto;
import vn.clinic.cdm.api.dto.messaging.RegisterFcmTokenRequest;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientNotificationService;
import vn.clinic.cdm.patient.service.PatientPortalService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/notifications")
@RequiredArgsConstructor
@Tag(name = "Patient Portal Notifications", description = "Quáº£n lÃ½ thÃ´ng bÃ¡o trong cá»•ng bá»‡nh nhÃ¢n")
@PreAuthorize("hasRole('PATIENT')")
public class PatientPortalNotificationController {

    private final PatientPortalService portalService;
    private final PatientNotificationService notificationService;

    @GetMapping
    @Operation(summary = "Láº¥y danh sÃ¡ch thÃ´ng bÃ¡o cá»§a bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<List<PatientNotificationDto>>> getNotifications() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotifications(p.getId())));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "ÄÃ¡nh dáº¥u thÃ´ng bÃ¡o Ä‘Ã£ Ä‘á»c")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        Patient p = portalService.getAuthenticatedPatient();
        notificationService.markAsRead(p.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/read-all")
    @Operation(summary = "ÄÃ¡nh dáº¥u táº¥t cáº£ thÃ´ng bÃ¡o Ä‘Ã£ Ä‘á»c")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Patient p = portalService.getAuthenticatedPatient();
        notificationService.markAllAsRead(p.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/register-token")
    @Operation(summary = "ÄÄƒng kÃ½ FCM token cho bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<Void>> registerToken(@RequestBody RegisterFcmTokenRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        notificationService.registerToken(p, request.getToken(), request.getDeviceType());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

