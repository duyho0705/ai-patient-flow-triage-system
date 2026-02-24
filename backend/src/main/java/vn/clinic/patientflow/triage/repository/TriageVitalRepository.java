package vn.clinic.patientflow.triage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.triage.domain.TriageVital;

import java.util.List;
import java.util.UUID;

public interface TriageVitalRepository extends JpaRepository<TriageVital, UUID> {

    List<TriageVital> findByTriageSessionIdOrderByRecordedAtAsc(UUID triageSessionId);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM TriageVital v JOIN v.triageSession s WHERE s.patient.id = :patientId ORDER BY v.recordedAt ASC")
    List<vn.clinic.patientflow.triage.domain.TriageVital> findByPatientId(
            @org.springframework.data.repository.query.Param("patientId") UUID patientId);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM TriageVital v JOIN v.triageSession s WHERE s.patient.id = :patientId ORDER BY v.recordedAt DESC")
    List<TriageVital> findTop5ByPatientIdOrderByRecordedAtDesc(
            @org.springframework.data.repository.query.Param("patientId") UUID patientId);
}
