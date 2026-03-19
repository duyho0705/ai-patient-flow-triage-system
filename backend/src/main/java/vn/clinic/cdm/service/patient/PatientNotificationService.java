package vn.clinic.cdm.service.patient;

import java.util.UUID;

public interface PatientNotificationService {
    void registerToken(vn.clinic.cdm.entity.patient.Patient patient, String fcmToken, String deviceType);
    void notifyPatient(UUID patientId, String title, String body, java.util.Map<String, String> data);
    
    java.util.List<vn.clinic.cdm.dto.messaging.PatientNotificationDto> getNotifications(UUID patientId);
    void markAsRead(UUID patientId, UUID notificationId);
    void markAllAsRead(UUID patientId);

    void sendMedicationReminders();
    void sendOverdueReminders();
}
