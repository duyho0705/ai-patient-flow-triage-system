package vn.clinic.cdm.service.notification.impl;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.dto.common.PushNotificationRequest;
import vn.clinic.cdm.service.notification.NotificationService;

@Service
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    @Override
    public void sendPushNotification(PushNotificationRequest request) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(request.title())
                    .setBody(request.body())
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(request.target())
                    .setNotification(notification);

            if (request.data() != null && !request.data().isEmpty()) {
                messageBuilder.putAllData(request.data());
            }

            Message message = messageBuilder.build();
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent FCM message: {}", response);
        } catch (Exception e) {
            log.error("Failed to send FCM message to token {}: {}", request.target(), e.getMessage());
        }
    }

    @Override
    public void sendTopicNotification(PushNotificationRequest request) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(request.title())
                    .setBody(request.body())
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setTopic(request.target())
                    .setNotification(notification);

            if (request.data() != null && !request.data().isEmpty()) {
                messageBuilder.putAllData(request.data());
            }

            Message message = messageBuilder.build();
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent topic message to {}: {}", request.target(), response);
        } catch (Exception e) {
            log.error("Failed to send topic message to {}: {}", request.target(), e.getMessage());
        }
    }
}
