package vn.clinic.patientflow.patient.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.patient.domain.MedicationReminder;
import vn.clinic.patientflow.patient.repository.MedicationReminderRepository;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationReminderScheduler {

    private final MedicationReminderRepository reminderRepository;
    private final PatientNotificationService notificationService;
    private final vn.clinic.patientflow.common.service.OmniChannelService omniChannelService;

    /**
     * Chạy mỗi phút để kiểm tra và gửi nhắc lịch uống thuốc.
     */
    @Scheduled(cron = "0 * * * * *")
    public void processReminders() {
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        LocalTime nextMinute = now.plusMinutes(1);

        log.debug("Checking medication reminders for time: {}", now);

        List<MedicationReminder> dueReminders = reminderRepository.findByIsActiveTrueAndReminderTimeBetween(now,
                nextMinute);

        if (dueReminders.isEmpty()) {
            return;
        }

        log.info("Found {} medication reminders due at {}", dueReminders.size(), now);

        for (MedicationReminder reminder : dueReminders) {
            sendNotification(reminder);
        }
    }

    private void sendNotification(MedicationReminder reminder) {
        String title = "🔔 Nhắc uống thuốc: " + reminder.getMedicineName();
        String body = String.format("Đã đến giờ uống thuốc: %s (Liều lượng: %s). Đừng quên nhé!",
                reminder.getMedicineName(),
                reminder.getDosage() != null ? reminder.getDosage() : "Theo chỉ dẫn");

        Map<String, String> data = Map.of(
                "type", "MEDICATION_REMINDER",
                "reminderId", reminder.getId().toString(),
                "medicineName", reminder.getMedicineName());

        notificationService.notifyPatient(reminder.getPatient().getId(), title, body, data);

        // 2. Gửi Omni-channel (Email, SMS, Zalo)
        var p = reminder.getPatient();
        omniChannelService.sendMedicationReminder(p.getFullNameVi(), p.getEmail(), p.getPhone(),
                reminder.getMedicineName(), reminder.getDosage());
    }
}
