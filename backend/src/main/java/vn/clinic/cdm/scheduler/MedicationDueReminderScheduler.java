package vn.clinic.cdm.scheduler;
import vn.clinic.cdm.service.patient.PatientNotificationService;
import vn.clinic.cdm.dto.common.ReminderRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.entity.clinical.MedicationSchedule;
import vn.clinic.cdm.repository.clinical.MedicationScheduleRepository;

import vn.clinic.cdm.service.common.OmniChannelService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/**
 * Enterprise Scheduler for Medication Reminders.
 * Ensures patients are notified on time for their medication dosage.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationDueReminderScheduler {

    private final MedicationScheduleRepository scheduleRepository;
    private final PatientNotificationService notificationService;
    private final OmniChannelService omniChannelService;

    /**
     * Runs every minute to check and send medication prompts.
     */
    @Scheduled(cron = "0 * * * * *")
    public void processReminders() {
        Instant startTime = Instant.now().truncatedTo(ChronoUnit.MINUTES);
        Instant endTime = startTime.plus(1, ChronoUnit.MINUTES);

        log.debug("Scanning medication schedules between {} and {}", startTime, endTime);

        List<MedicationSchedule> dueSchedules = scheduleRepository.findByStatusAndScheduledTimeBetween("PENDING", startTime, endTime);

        if (dueSchedules.isEmpty()) {
            return;
        }

        log.info("Found {} medication schedules due for processing", dueSchedules.size());

        for (MedicationSchedule schedule : dueSchedules) {
            try {
                processSingleSchedule(schedule);
            } catch (Exception e) {
                log.error("Failed to process medication reminder for schedule ID: {}", schedule.getId(), e);
            }
        }
    }

    private void processSingleSchedule(MedicationSchedule schedule) {
        var medication = schedule.getMedication();
        var patient = medication.getPrescription().getPatient();

        String title = "🔔 Nhắc uống thuốc: " + medication.getMedicineName();
        String body = String.format("Đã đến giờ uống thuốc: %s (Liều lượng: %s). Đừng quên nhé!",
                medication.getMedicineName(),
                medication.getDosageInstruction() != null ? medication.getDosageInstruction() : "Theo chỉ dẫn");

        Map<String, String> data = Map.of(
                "type", "MEDICATION_REMINDER",
                "scheduleId", schedule.getId().toString(),
                "medicineName", medication.getMedicineName());

        log.debug("Sending notifications for patient: {} (ID: {})", patient.getFullNameVi(), patient.getId());
        
        notificationService.notifyPatient(patient.getId(), title, body, data);

        // Omni-channel (Email, SMS, Zalo)
        omniChannelService.sendMedicationReminder(new ReminderRequest(
                patient.getFullNameVi(), 
                patient.getEmail(), 
                patient.getPhone(),
                medication.getMedicineName(), 
                medication.getDosageInstruction()
        ));
        
        log.info("Reminder sent successfully for schedule: {}", schedule.getId());
    }
}
