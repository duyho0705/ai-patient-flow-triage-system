package vn.clinic.patientflow.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.patient.domain.MedicationReminder;
import vn.clinic.patientflow.patient.repository.MedicationReminderRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicationReminderService {

    private final MedicationReminderRepository medicationReminderRepository;

    public List<MedicationReminder> getRemindersByPatient(UUID patientId) {
        return medicationReminderRepository.findByPatientId(patientId);
    }

    @Transactional
    public MedicationReminder create(MedicationReminder reminder) {
        return medicationReminderRepository.save(reminder);
    }

    @Transactional
    public MedicationReminder update(UUID id, MedicationReminder updates) {
        MedicationReminder existing = medicationReminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationReminder", id));

        existing.setMedicineName(updates.getMedicineName());
        existing.setReminderTime(updates.getReminderTime());
        existing.setDosage(updates.getDosage());
        existing.setIsActive(updates.getIsActive());
        existing.setNotes(updates.getNotes());

        return medicationReminderRepository.save(existing);
    }

    @Transactional
    public void delete(UUID id) {
        medicationReminderRepository.deleteById(id);
    }

    public MedicationReminder getById(UUID id) {
        return medicationReminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationReminder", id));
    }

    @Transactional
    public MedicationReminder recordDoseTaken(UUID id) {
        MedicationReminder reminder = getById(id);

        // Cập nhật số liều đã uống
        int currentDoses = reminder.getTotalDosesTaken() != null ? reminder.getTotalDosesTaken() : 0;
        reminder.setTotalDosesTaken(currentDoses + 1);
        reminder.setLastTakenAt(java.time.Instant.now());

        // Tính điểm tuân thủ sơ bộ (Adherence Score)
        // Trong thực tế sẽ tính dựa trên số liều đã uống so với số liều cần uống từ lúc
        // bắt đầu
        // Ở đây chúng ta giả lập bằng cách tăng dần điểm tuân thủ nhưng không vượt quá
        // 100%
        java.math.BigDecimal currentScore = reminder.getAdherenceScore() != null ? reminder.getAdherenceScore()
                : java.math.BigDecimal.ZERO;
        if (currentScore.compareTo(new java.math.BigDecimal("95")) < 0) {
            reminder.setAdherenceScore(currentScore.add(new java.math.BigDecimal("5")));
        } else {
            reminder.setAdherenceScore(new java.math.BigDecimal("100"));
        }

        return medicationReminderRepository.save(reminder);
    }
}
