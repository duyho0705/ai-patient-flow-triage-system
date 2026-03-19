package vn.clinic.cdm.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import vn.clinic.cdm.entity.clinical.MedicationSchedule;
import vn.clinic.cdm.repository.clinical.MedicationScheduleRepository;
import vn.clinic.cdm.service.patient.PatientNotificationService;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicationOverdueReminderScheduler {

    private final MedicationScheduleRepository scheduleRepository;
    private final PatientNotificationService notificationService;

    /**
     * Chạy mỗi 15 phút để kiểm tra các lịch uống thuốc bị bỏ lỡ hoặc đến giờ.
     */
    @Scheduled(fixedRate = 900000) // 15 minutes
    public void processOverdueMedications() {
        log.info("Starting Medication Reminder Job at {}", Instant.now());

        // Lấy tất cả các lịch PENDING đã quá giờ scheduledTime
        List<MedicationSchedule> overdue = scheduleRepository.findByStatusAndScheduledTimeBefore("PENDING",
                Instant.now());

        for (MedicationSchedule schedule : overdue) {
            try {
                String medicineName = schedule.getMedication().getMedicineName();
                var patient = schedule.getMedication().getPrescription().getPatient();

                log.info("Sending alert to patient {} for medicine {}", patient.getId(), medicineName);

                notificationService.notifyPatient(
                        patient.getId(),
                        "🔔 Nhắc uống thuốc",
                        String.format(
                                "Đã đến giờ uống thuốc: %s. Vui lòng uống thuốc và đánh dấu 'Đã uống' trên ứng dụng.",
                                medicineName),
                        Map.of(
                                "type", "MEDICATION_REMINDER",
                                "scheduleId", schedule.getId().toString(),
                                "medicineName", medicineName));

                // Tránh spam - trong thực tế sẽ đánh dấu là NOTIFIED để không gửi lại trong lần
                // chạy sau
                // Ở đây demo nên ta giữ nguyên hoặc có thể update status tạm.
            } catch (Exception e) {
                log.error("Error processing reminder for schedule {}: {}", schedule.getId(), e.getMessage());
            }
        }
    }
}
