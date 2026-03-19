package vn.clinic.cdm.service.common.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.dto.common.EmailRequest;
import vn.clinic.cdm.dto.common.ReminderRequest;
import vn.clinic.cdm.service.common.EmailService;
import vn.clinic.cdm.service.common.OmniChannelService;

@Service
@RequiredArgsConstructor
@Slf4j
public class OmniChannelServiceImpl implements OmniChannelService {

    private final EmailService emailService;

    @Override
    public void sendMedicationReminder(ReminderRequest request) {
        String title = "Nhắc uống thuốc: " + request.medicineName();
        String body = String.format(
                "Chào %s, đã đến giờ uống thuốc: %s (Liều lượng: %s). Hệ thống AI Healthcare nhắc bạn đừng quên nhé!",
                request.fullName(), request.medicineName(), request.dosage() != null ? request.dosage() : "Theo chỉ dẫn");

        // 1. Gửi qua Email
        if (request.email() != null && !request.email().isBlank()) {
            emailService.sendEmailWithAttachment(new EmailRequest(request.email(), title, body, null, null));
        }

        // 2. Gửi qua "Zalo / SMS" (Mock/Placeholder)
        if (request.phone() != null && !request.phone().isBlank()) {
            sendZaloPlaceholder(request.phone(), body);
            sendSmsPlaceholder(request.phone(), body);
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
