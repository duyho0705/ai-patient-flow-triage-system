package vn.clinic.patientflow.triage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.triage.domain.TriageVital;

import java.util.List;
import java.util.UUID;

public interface TriageVitalRepository extends JpaRepository<TriageVital, UUID> {

    List<TriageVital> findByTriageSessionIdOrderByRecordedAtAsc(UUID triageSessionId);
}
