package vn.clinic.cdm.repository.clinical;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.clinical.ClinicalConsultation;
import vn.clinic.cdm.entity.clinical.LabResult;

import java.util.List;
import java.util.UUID;

public interface LabResultRepository extends JpaRepository<LabResult, UUID> {
    List<LabResult> findByConsultation(ClinicalConsultation consultation);

    List<LabResult> findByConsultationPatientIdOrderByCreatedAtDesc(UUID patientId);
}

