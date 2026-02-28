package vn.clinic.cdm.common.notification;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.api.dto.messaging.SendChatNotificationRequest;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatNotificationService {

    private final NotificationService fcmService;

    public void handleSendChatNotification(SendChatNotificationRequest request) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            String recipientId = request.getRecipientId();
            if (recipientId == null) {
                log.warn("Recipient ID is null, skipping chat notification");
                return;
            }

            DocumentSnapshot userDoc = db.collection("users").document(recipientId).get().get();
            if (!userDoc.exists() || userDoc.getString("fcmToken") == null) {
                log.info("No FCM token found in Firestore for user {}", recipientId);
                return;
            }

            String fcmToken = userDoc.getString("fcmToken");
            String senderName = "Bá»‡nh nhÃ¢n";

            if ("DOCTOR".equals(request.getSenderType())) {
                senderName = "BÃ¡c sÄ©";
            } else if ("PATIENT".equals(request.getSenderType())) {
                senderName = "Bá»‡nh nhÃ¢n";
            }

            // You can also look up the sender's name if you want, or just stick to "BÃ¡c sÄ©
            // / Bá»‡nh nhÃ¢n"

            String content = request.getContent();
            if (Boolean.TRUE.equals(request.getIsImage())) {
                content = "[HÃ¬nh áº£nh]";
            } else if (request.getFileUrl() != null && !request.getFileUrl().isEmpty()) {
                content = "[Táº­p tin Ä‘Ã­nh kÃ¨m]";
            }

            Map<String, String> data = new HashMap<>();
            data.put("type", "chat");
            data.put("roomId", request.getRoomId());
            data.put("link", "PATIENT".equals(request.getSenderType()) ? "/chat" : "/patient/chat");

            fcmService.sendPushNotification(fcmToken, "Tin nháº¯n má»›i tá»« " + senderName, content, data);

        } catch (Exception e) {
            log.error("Failed to handle chat notification: {}", e.getMessage());
        }
    }
}

