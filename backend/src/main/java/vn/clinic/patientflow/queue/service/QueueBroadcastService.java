package vn.clinic.patientflow.queue.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.common.notification.NotificationService;
import vn.clinic.patientflow.patient.repository.PatientDeviceTokenRepository;
import vn.clinic.patientflow.patient.domain.PatientDeviceToken;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import vn.clinic.patientflow.api.dto.PatientEventDto;
import vn.clinic.patientflow.api.dto.PatientEventDto.EventType;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueueBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final PatientDeviceTokenRepository deviceTokenRepository;
    private final vn.clinic.patientflow.patient.repository.PatientNotificationRepository patientNotificationRepository;
    private final vn.clinic.patientflow.patient.repository.PatientRepository patientRepository;

    /**
     * Thông báo cho tất cả client trong một chi nhánh rằng hàng chờ đã thay đổi.
     * Topic format: /topic/queue/{branchId}
     */
    public void broadcastQueueUpdate(UUID branchId) {
        String destination = "/topic/queue/" + branchId;
        log.debug("Broadcasting queue update to {}", destination);

        PatientEventDto event = PatientEventDto.builder()
                .type(EventType.QUEUE_REFRESH)
                .build();

        messagingTemplate.convertAndSend(destination, event);
    }

    /**
     * Thông báo riêng cho một bệnh nhân.
     */
    public void notifyPatient(UUID patientId, String message) {
        createAndSendNotification(patientId, "Thông báo hàng chờ", message, "QUEUE", null);
    }

    /**
     * Thông báo cho bệnh nhân rằng hóa đơn đã sẵn sàng để thanh toán.
     */
    public void notifyBillingReady(UUID patientId, UUID invoiceId, String amount) {
        String message = String
                .format("Hóa đơn của bạn đã sẵn sàng. Số tiền: %s VNĐ. Vui lòng thanh toán tại quầy thu ngân.", amount);
        createAndSendNotification(patientId, "Hóa đơn mới", message, "BILLING", invoiceId.toString());
    }

    /**
     * Thông báo cho bệnh nhân rằng thuốc đã được cấp phát.
     */
    public void notifyPharmacyReady(UUID patientId, UUID prescriptionId) {
        String message = "Thuốc của bạn đã được chuẩn bị xong. Vui lòng nhận tại quầy Dược.";
        createAndSendNotification(patientId, "Nhận thuốc", message, "PHARMACY", prescriptionId.toString());
    }

    /**
     * Phương thức chung để tạo, lưu và gửi thông báo đa kênh.
     */
    private void createAndSendNotification(UUID patientId, String title, String body, String type, String resourceId) {
        vn.clinic.patientflow.patient.domain.Patient patient = patientRepository.findById(patientId).orElse(null);
        if (patient == null)
            return;

        // 1. Lưu vào Database
        vn.clinic.patientflow.patient.domain.PatientNotification persistentNotif = vn.clinic.patientflow.patient.domain.PatientNotification
                .builder()
                .tenant(patient.getTenant())
                .patient(patient)
                .title(title)
                .content(body)
                .type(type)
                .relatedResourceId(resourceId)
                .createdAt(java.time.Instant.now())
                .isRead(false)
                .build();
        patientNotificationRepository.save(persistentNotif);

        // 2. Gửi qua WebSocket (cho các app đang mở)
        String destination = "/topic/patient/" + patientId;
        log.debug("Broadcasting to WebSocket: {} - {}", destination, body);

        PatientEventDto event = PatientEventDto.builder()
                .type(EventType.valueOf(type))
                .title(title)
                .body(body)
                .metadata(Map.of(
                        "id", persistentNotif.getId().toString(),
                        "resourceId", resourceId != null ? resourceId : "",
                        "createdAt", persistentNotif.getCreatedAt().toString()))
                .build();

        messagingTemplate.convertAndSend(destination, event);

        // 3. Gửi qua Push Notification (FCM)
        List<PatientDeviceToken> tokens = deviceTokenRepository.findByPatientId(patientId);
        if (!tokens.isEmpty()) {
            for (PatientDeviceToken t : tokens) {
                notificationService.sendPushNotification(
                        t.getFcmToken(),
                        title,
                        body,
                        Map.of(
                                "patientId", patientId.toString(),
                                "notifId", persistentNotif.getId().toString(),
                                "type", type,
                                "resourceId", resourceId != null ? resourceId : ""));
            }
        }
    }

    /**
     * Thông báo cho nhân viên y tế (Bác sĩ, Điều dưỡng) khi có trường hợp cấp
     * cứu/nguy kịch.
     * Topic format: /topic/staff/{branchId}
     */
    public void broadcastUrgentAlert(UUID branchId, String patientName, String acuityLevel, String complaint) {
        String destination = "/topic/staff/" + branchId;
        log.warn("Broadcasting URGENT ALERT to {}: BN {} - Mức độ: {}", destination, patientName, acuityLevel);

        Map<String, String> alert = Map.of(
                "type", "URGENT_TRIAGE_ALERT",
                "patientName", patientName,
                "acuityLevel", acuityLevel,
                "complaint", complaint,
                "timestamp", java.time.Instant.now().toString());

        messagingTemplate.convertAndSend(destination, alert);
    }
}
