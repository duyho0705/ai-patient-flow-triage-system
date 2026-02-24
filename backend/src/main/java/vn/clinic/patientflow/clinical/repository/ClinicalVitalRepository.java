package vn.clinic.patientflow.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.clinical.domain.ClinicalVital;

import java.util.List;
import java.util.UUID;

public interface ClinicalVitalRepository extends JpaRepository<ClinicalVital, UUID> {

    List<ClinicalVital> findByConsultationIdOrderByRecordedAtAsc(UUID consultationId);

    List<ClinicalVital> findTop10ByConsultationPatientIdOrderByRecordedAtDesc(UUID patientId);
}
