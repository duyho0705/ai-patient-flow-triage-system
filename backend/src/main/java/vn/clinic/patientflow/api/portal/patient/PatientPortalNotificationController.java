package vn.clinic.patientflow.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.PatientNotificationDto;
import vn.clinic.patientflow.api.dto.RegisterFcmTokenRequest;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientNotificationService;
import vn.clinic.patientflow.patient.service.PatientPortalService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/notifications")
@RequiredArgsConstructor
@Tag(name = "Patient Portal Notifications", description = "Quản lý thông báo trong cổng bệnh nhân")
@PreAuthorize("hasRole('PATIENT')")
public class PatientPortalNotificationController {

    private final PatientPortalService portalService;
    private final PatientNotificationService notificationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo của bệnh nhân")
    public ResponseEntity<ApiResponse<List<PatientNotificationDto>>> getNotifications() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotifications(p.getId())));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Đánh dấu thông báo đã đọc")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        Patient p = portalService.getAuthenticatedPatient();
        notificationService.markAsRead(p.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Patient p = portalService.getAuthenticatedPatient();
        notificationService.markAllAsRead(p.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/register-token")
    @Operation(summary = "Đăng ký FCM token cho bệnh nhân")
    public ResponseEntity<ApiResponse<Void>> registerToken(@RequestBody RegisterFcmTokenRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        notificationService.registerToken(p, request.getToken(), request.getDeviceType());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
