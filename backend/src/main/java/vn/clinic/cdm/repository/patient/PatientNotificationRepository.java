package vn.clinic.cdm.repository.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.entity.patient.PatientNotification;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientNotificationRepository extends JpaRepository<PatientNotification, UUID> {
    List<PatientNotification> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    long countByPatientIdAndIsReadFalse(UUID patientId);
}

