package vn.clinic.patientflow.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;

import java.util.UUID;

public interface ClinicalConsultationRepository extends JpaRepository<ClinicalConsultation, UUID> {
}
