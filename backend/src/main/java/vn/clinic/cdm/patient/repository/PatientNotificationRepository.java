package vn.clinic.cdm.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.patient.domain.PatientNotification;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientNotificationRepository extends JpaRepository<PatientNotification, UUID> {
    List<PatientNotification> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    long countByPatientIdAndIsReadFalse(UUID patientId);
}

