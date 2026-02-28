package vn.clinic.cdm.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.patient.domain.PatientChronicCondition;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientChronicConditionRepository extends JpaRepository<PatientChronicCondition, UUID> {
    List<PatientChronicCondition> findByPatientId(UUID patientId);

    List<PatientChronicCondition> findByPatientIdAndStatus(UUID patientId, String status);
}

