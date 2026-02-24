package vn.clinic.patientflow.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OmniChannelService {

    private final EmailService emailService;

    public void sendMedicationReminder(String fullName, String email, String phone, String medicineName,
            String dosage) {
        String title = "🔔 Nhắc uống thuốc: " + medicineName;
        String body = String.format(
                "Chào %s, đã đến giờ uống thuốc: %s (Liều lượng: %s). Hệ thống AI Healthcare nhắc bạn đừng quên nhé!",
                fullName, medicineName, dosage != null ? dosage : "Theo chỉ dẫn");

        // 1. Gửi qua Email
        if (email != null && !email.isBlank()) {
            emailService.sendEmailWithAttachment(email, title, body, null, null);
        }

        // 2. Gửi qua "Zalo / SMS" (Mock/Placeholder)
        if (phone != null && !phone.isBlank()) {
            sendZaloPlaceholder(phone, body);
            sendSmsPlaceholder(phone, body);
        }

        // 3. FCM Push is usually managed by PatientNotificationService which has access
        // to device tokens
    }

    private void sendZaloPlaceholder(String phone, String body) {
        // Đây là nơi tích hợp Zalo OA API (Zalo Official Account)
        // Hiện tại: Chỉ log để demo khả năng mở rộng
        log.info("[ZALO GATEWAY] Gửi tin nhắn tới {}: {}", phone, body);
    }

    private void sendSmsPlaceholder(String phone, String body) {
        // Đây là nơi tích hợp SMS Brandname API (e.g. SpeedSMS, eSMS)
        log.info("[SMS GATEWAY] Gửi tin nhắn tới {}: {}", phone, body);
    }
}
