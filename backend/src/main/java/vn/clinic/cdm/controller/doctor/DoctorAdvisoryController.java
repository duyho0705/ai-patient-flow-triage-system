package vn.clinic.cdm.controller.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.dto.messaging.SendAdviceRequest;
import vn.clinic.cdm.security.AuthPrincipal;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.entity.patient.Patient;
import vn.clinic.cdm.entity.patient.PatientNotification;
import vn.clinic.cdm.repository.patient.PatientNotificationRepository;
import vn.clinic.cdm.service.patient.PatientNotificationService;
import vn.clinic.cdm.service.patient.PatientService;
import vn.clinic.cdm.service.tenant.TenantService;

import java.util.Map;
import java.util.UUID;

/**
 * Gửi Khuyến nghị / Cảnh báo — Doctor Portal.
 * <p>
 * Bác sĩ có thể:
 * - Gửi lời khuyên (ADVICE) cho bệnh nhân
 * - Gửi cảnh báo sức khỏe (ALERT) cho bệnh nhân
 * <p>
 * Mỗi lần gửi sẽ:
 * 1. Lưu thông báo vào DB
 * 2. Push notification qua FCM (nếu có device token)
 */
@RestController
@RequestMapping("/api/doctor-portal/patients/{patientId}")
@RequiredArgsConstructor
@Tag(name = "Doctor Advisory", description = "Gửi khuyến nghị và cảnh báo cho bệnh nhân")
@Slf4j
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorAdvisoryController {

    private final PatientService patientService;
    private final PatientNotificationService notificationService;
    private final PatientNotificationRepository notificationRepository;
    private final TenantService tenantService;

    @PostMapping("/advice")
    @Operation(summary = "Gửi lời khuyên / khuyến nghị cho bệnh nhân")
    public ResponseEntity<ApiResponse<String>> sendAdvice(
            @PathVariable UUID patientId,
            @Valid @RequestBody SendAdviceRequest request) {

        return sendNotification(patientId, request, "ADVICE");
    }

    @PostMapping("/alert")
    @Operation(summary = "Gửi cảnh báo sức khỏe khẩn cấp cho bệnh nhân")
    public ResponseEntity<ApiResponse<String>> sendAlert(
            @PathVariable UUID patientId,
            @Valid @RequestBody SendAdviceRequest request) {

        return sendNotification(patientId, request, "ALERT");
    }

    // ─── Core Logic ──────────────────────────────

    private ResponseEntity<ApiResponse<String>> sendNotification(
            UUID patientId, SendAdviceRequest request, String fallbackType) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Patient patient = patientService.getById(patientId);
        UUID tenantId = TenantContext.getTenantIdOrThrow();

        String notifType = request.getType() != null ? request.getType() : fallbackType;

        // 1. Lưu thông báo vào DB
        PatientNotification notification = PatientNotification.builder()
                .tenant(tenantService.getById(tenantId))
                .patient(patient)
                .title(request.getTitle())
                .content(request.getContent())
                .type(notifType)
                .relatedResourceId(doctorUserId.toString())
                .build();
        notificationRepository.save(notification);

        // 2. Push notification qua FCM
        try {
            notificationService.notifyPatient(
                    patientId,
                    request.getTitle(),
                    request.getContent(),
                    Map.of(
                            "type", notifType,
                            "severity", request.getSeverity() != null ? request.getSeverity() : "INFO",
                            "doctorUserId", doctorUserId.toString()));
        } catch (Exception e) {
            log.warn("Push notification failed for patient {}: {}", patientId, e.getMessage());
        }

        log.info("Doctor {} sent {} to patient {}: {}", doctorUserId, notifType, patientId, request.getTitle());
        return ResponseEntity.ok(ApiResponse.success(
                "Đã gửi " + notifType.toLowerCase() + " thành công tới bệnh nhân " + patient.getFullNameVi()));
    }
}
