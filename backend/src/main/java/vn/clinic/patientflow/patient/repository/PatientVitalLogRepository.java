package vn.clinic.patientflow.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.patientflow.patient.domain.PatientVitalLog;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface PatientVitalLogRepository extends JpaRepository<PatientVitalLog, UUID> {
    List<PatientVitalLog> findByPatientIdOrderByRecordedAtDesc(UUID patientId);

    List<PatientVitalLog> findByPatientIdAndVitalTypeOrderByRecordedAtDesc(UUID patientId, String vitalType);

    List<PatientVitalLog> findByPatientIdAndVitalTypeAndRecordedAtBetweenOrderByRecordedAtAsc(
            UUID patientId, String vitalType, Instant from, Instant to);

    List<PatientVitalLog> findByPatientIdAndRecordedAtAfterOrderByRecordedAtDesc(UUID patientId, Instant after);
}
