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

@Service
@RequiredArgsConstructor
@Slf4j
public class QueueBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final PatientDeviceTokenRepository deviceTokenRepository;

    /**
     * Thông báo cho tất cả client trong một chi nhánh rằng hàng chờ đã thay đổi.
     * Topic format: /topic/queue/{branchId}
     */
    public void broadcastQueueUpdate(UUID branchId) {
        String destination = "/topic/queue/" + branchId;
        log.debug("Broadcasting queue update to {}", destination);

        // Gửi một thông điệp đơn giản để báo hiệu frontend cần refetch data
        // Hoặc có thể gửi luôn danh sách hàng chờ mới nếu muốn tối ưu hơn
        messagingTemplate.convertAndSend(destination, "REFRESH_QUEUE");
    }

    /**
     * Thông báo riêng cho một bệnh nhân (ví dụ: "Đã đến lượt bạn").
     * Topic format: /topic/patient/{patientId}
     */
    public void notifyPatient(UUID patientId, String message) {
        // 1. Gửi qua WebSocket (cho các app đang mở)
        String destination = "/topic/patient/" + patientId;
        log.debug("Notifying patient {} at destination {}", patientId, destination);
        messagingTemplate.convertAndSend(destination, message);

        // 2. Gửi qua Push Notification (FCM) cho các thiết bị đã đăng ký
        List<PatientDeviceToken> tokens = deviceTokenRepository.findByPatientId(patientId);
        if (!tokens.isEmpty()) {
            for (PatientDeviceToken t : tokens) {
                notificationService.sendPushNotification(
                        t.getFcmToken(),
                        "Thông báo từ Phòng khám",
                        message,
                        Map.of("patientId", patientId.toString(), "type", "QUEUE_CALL"));
            }
        }
    }
}
