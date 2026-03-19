package vn.clinic.cdm.repository.clinical;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.clinical.ClinicalVital;

import java.util.List;
import java.util.UUID;

public interface ClinicalVitalRepository extends JpaRepository<ClinicalVital, UUID> {

    List<ClinicalVital> findByConsultationIdOrderByRecordedAtAsc(UUID consultationId);

    List<ClinicalVital> findTop10ByConsultationPatientIdOrderByRecordedAtDesc(UUID patientId);
}

