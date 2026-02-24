package vn.clinic.patientflow.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.clinical.domain.LabResult;

import java.util.List;
import java.util.UUID;

public interface LabResultRepository extends JpaRepository<LabResult, UUID> {
    List<LabResult> findByConsultation(ClinicalConsultation consultation);

    List<LabResult> findByConsultationPatientIdOrderByCreatedAtDesc(UUID patientId);
}
