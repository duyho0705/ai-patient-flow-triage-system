package vn.clinic.cdm.clinical.service;

import org.springframework.stereotype.Component;
import vn.clinic.cdm.api.dto.medication.MedicationReminderDto;
import vn.clinic.cdm.clinical.domain.MedicationSchedule;

import java.time.ZoneId;

/**
 * Mapper for Medication-related DTOs.
 */
@Component
public class MedicationMapper {

    public MedicationReminderDto toReminderDto(MedicationSchedule schedule) {
        if (schedule == null)
            return null;

        return MedicationReminderDto.builder()
                .id(schedule.getId())
                .medicineName(schedule.getMedication().getMedicineName())
                .reminderTime(schedule.getScheduledTime()
                        .atZone(ZoneId.systemDefault())
                        .toLocalTime().toString()
                        .substring(0, 5))
                .dosage(schedule.getMedication().getDosage())
                .isActive(true)
                .notes(getNotesFromStatus(schedule))
                .build();
    }

    private String getNotesFromStatus(MedicationSchedule schedule) {
        if ("TAKEN".equals(schedule.getStatus())) {
            return "Đã uống";
        }
        return "PENDING".equals(schedule.getStatus()) ? "Chưa uống" : schedule.getStatus();
    }
}
