package vn.clinic.patientflow.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.patientflow.patient.domain.PatientVitalTarget;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientVitalTargetRepository extends JpaRepository<PatientVitalTarget, UUID> {
    List<PatientVitalTarget> findByPatientId(UUID patientId);
}
