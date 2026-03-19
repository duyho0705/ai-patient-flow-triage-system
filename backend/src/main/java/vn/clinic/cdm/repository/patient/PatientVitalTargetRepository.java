package vn.clinic.cdm.repository.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.entity.patient.PatientVitalTarget;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientVitalTargetRepository extends JpaRepository<PatientVitalTarget, UUID> {
    List<PatientVitalTarget> findByPatientId(UUID patientId);
}

