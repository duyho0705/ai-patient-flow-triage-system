package vn.clinic.cdm.patient.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.api.dto.messaging.PatientNotificationDto;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;
import vn.clinic.cdm.common.notification.NotificationService;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.domain.PatientDeviceToken;
import vn.clinic.cdm.patient.repository.PatientDeviceTokenRepository;
import vn.clinic.cdm.patient.repository.PatientNotificationRepository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientNotificationService {

    private final PatientDeviceTokenRepository tokenRepository;
    private final PatientNotificationRepository notificationRepository;
    private final NotificationService fcmService;

    // --- Device Token Management ---

    @Transactional
    public void registerToken(Patient patient, String fcmToken, String deviceType) {
        tokenRepository.findByFcmToken(fcmToken).ifPresentOrElse(
                existing -> {
                    existing.setPatient(patient);
                    existing.setDeviceType(deviceType);
                    existing.setLastSeenAt(Instant.now());
                    tokenRepository.save(existing);
                },
                () -> {
                    PatientDeviceToken newToken = PatientDeviceToken.builder()
                            .patient(patient)
                            .fcmToken(fcmToken)
                            .deviceType(deviceType)
                            .lastSeenAt(Instant.now())
                            .build();
                    tokenRepository.save(newToken);
                });
    }

    // --- Notification Query & Actions ---

    public List<PatientNotificationDto> getNotifications(UUID patientId) {
        return notificationRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(PatientNotificationDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(UUID patientId, UUID notificationId) {
        var notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!notif.getPatient().getId().equals(patientId)) {
            throw new ResourceNotFoundException("Notification", notificationId);
        }
        notif.setRead(true);
        notificationRepository.save(notif);
    }

    @Transactional
    public void markAllAsRead(UUID patientId) {
        var notifications = notificationRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    // --- Push Notification ---

    public void notifyPatient(UUID patientId, String title, String body, Map<String, String> data) {
        var tokens = tokenRepository.findByPatientId(patientId);
        if (tokens.isEmpty()) {
            log.warn("No FCM tokens found for patient {}", patientId);
            return;
        }

        for (var token : tokens) {
            fcmService.sendPushNotification(token.getFcmToken(), title, body, data);
        }
    }
}

