package vn.clinic.cdm.common.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import vn.clinic.cdm.clinical.domain.MedicationSchedule;
import vn.clinic.cdm.clinical.repository.MedicationScheduleRepository;
import vn.clinic.cdm.patient.service.PatientNotificationService;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicationReminderScheduler {

    private final MedicationScheduleRepository scheduleRepository;
    private final PatientNotificationService notificationService;

    /**
     * Cháº¡y má»—i 15 phÃºt Ä‘á»ƒ kiá»ƒm tra cÃ¡c lá»‹ch uá»‘ng thuá»‘c bá»‹ bá» lá»¡ hoáº·c Ä‘áº¿n giá».
     */
    @Scheduled(fixedRate = 900000) // 15 minutes
    public void processOverdueMedications() {
        log.info("Starting Medication Reminder Job at {}", Instant.now());

        // Láº¥y táº¥t cáº£ cÃ¡c lá»‹ch PENDING Ä‘Ã£ quÃ¡ giá» scheduledTime
        List<MedicationSchedule> overdue = scheduleRepository.findByStatusAndScheduledTimeBefore("PENDING",
                Instant.now());

        for (MedicationSchedule schedule : overdue) {
            try {
                String medicineName = schedule.getMedication().getMedicineName();
                var patient = schedule.getMedication().getPrescription().getPatient();

                log.info("Sending alert to patient {} for medicine {}", patient.getId(), medicineName);

                notificationService.notifyPatient(
                        patient.getId(),
                        "ðŸ”” Nháº¯c uá»‘ng thuá»‘c",
                        String.format(
                                "ÄÃ£ Ä‘áº¿n giá» uá»‘ng thuá»‘c: %s. Vui lÃ²ng uá»‘ng thuá»‘c vÃ  Ä‘Ã¡nh dáº¥u 'ÄÃ£ uá»‘ng' trÃªn á»©ng dá»¥ng.",
                                medicineName),
                        Map.of(
                                "type", "MEDICATION_REMINDER",
                                "scheduleId", schedule.getId().toString(),
                                "medicineName", medicineName));

                // TrÃ¡nh spam - trong thá»±c táº¿ sáº½ Ä‘Ã¡nh dáº¥u lÃ  NOTIFIED Ä‘á»ƒ khÃ´ng gá»­i láº¡i trong láº§n
                // cháº¡y sau
                // á»ž Ä‘Ã¢y demo nÃªn ta giá»¯ nguyÃªn hoáº·c cÃ³ thá»ƒ update status táº¡m.
            } catch (Exception e) {
                log.error("Error processing reminder for schedule {}: {}", schedule.getId(), e.getMessage());
            }
        }
    }
}

