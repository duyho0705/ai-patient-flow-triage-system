package vn.clinic.patientflow.triage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.triage.domain.TriageComplaint;

import java.util.List;
import java.util.UUID;

public interface TriageComplaintRepository extends JpaRepository<TriageComplaint, UUID> {

    List<TriageComplaint> findByTriageSessionIdOrderByDisplayOrderAsc(UUID triageSessionId);
}
