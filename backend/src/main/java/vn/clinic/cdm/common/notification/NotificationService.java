package vn.clinic.cdm.common.notification;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class NotificationService {

    /**
     * Gá»­i thÃ´ng bÃ¡o Ä‘áº¿n má»™t thiáº¿t bá»‹ cá»¥ thá»ƒ qua FCM token.
     */
    public void sendPushNotification(String token, String title, String body, Map<String, String> data) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(token)
                    .setNotification(notification);

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent FCM message: {}", response);
        } catch (Exception e) {
            log.error("Failed to send FCM message to token {}: {}", token, e.getMessage());
        }
    }

    /**
     * Gá»­i thÃ´ng bÃ¡o theo topic (vÃ­ dá»¥ cho sáº£nh chá» hoáº·c khoa).
     */
    public void sendTopicNotification(String topic, String title, String body, Map<String, String> data) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setTopic(topic)
                    .setNotification(notification);

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent topic message to {}: {}", topic, response);
        } catch (Exception e) {
            log.error("Failed to send topic message to {}: {}", topic, e.getMessage());
        }
    }
}

