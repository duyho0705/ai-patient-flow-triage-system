package vn.clinic.cdm.common.service;

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
        String title = "ðŸ”” Nháº¯c uá»‘ng thuá»‘c: " + medicineName;
        String body = String.format(
                "ChÃ o %s, Ä‘Ã£ Ä‘áº¿n giá» uá»‘ng thuá»‘c: %s (Liá»u lÆ°á»£ng: %s). Há»‡ thá»‘ng AI Healthcare nháº¯c báº¡n Ä‘á»«ng quÃªn nhÃ©!",
                fullName, medicineName, dosage != null ? dosage : "Theo chá»‰ dáº«n");

        // 1. Gá»­i qua Email
        if (email != null && !email.isBlank()) {
            emailService.sendEmailWithAttachment(email, title, body, null, null);
        }

        // 2. Gá»­i qua "Zalo / SMS" (Mock/Placeholder)
        if (phone != null && !phone.isBlank()) {
            sendZaloPlaceholder(phone, body);
            sendSmsPlaceholder(phone, body);
        }

        // 3. FCM Push is usually managed by PatientNotificationService which has access
        // to device tokens
    }

    private void sendZaloPlaceholder(String phone, String body) {
        // ÄÃ¢y lÃ  nÆ¡i tÃ­ch há»£p Zalo OA API (Zalo Official Account)
        // Hiá»‡n táº¡i: Chá»‰ log Ä‘á»ƒ demo kháº£ nÄƒng má»Ÿ rá»™ng
        log.info("[ZALO GATEWAY] Gá»­i tin nháº¯n tá»›i {}: {}", phone, body);
    }

    private void sendSmsPlaceholder(String phone, String body) {
        // ÄÃ¢y lÃ  nÆ¡i tÃ­ch há»£p SMS Brandname API (e.g. SpeedSMS, eSMS)
        log.info("[SMS GATEWAY] Gá»­i tin nháº¯n tá»›i {}: {}", phone, body);
    }
}

