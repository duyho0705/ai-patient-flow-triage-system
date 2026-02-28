package vn.clinic.cdm.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.patient.domain.PatientVitalLog;
import java.util.List;
import java.util.UUID;

@Repository
public interface PatientVitalLogRepository extends JpaRepository<PatientVitalLog, UUID> {
    List<PatientVitalLog> findByPatientId(UUID patientId);

    List<PatientVitalLog> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
}

