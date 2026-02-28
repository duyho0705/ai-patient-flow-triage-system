package vn.clinic.cdm.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.clinical.domain.ClinicalConsultation;
import vn.clinic.cdm.clinical.domain.DiagnosticImage;

import java.util.List;
import java.util.UUID;

public interface DiagnosticImageRepository extends JpaRepository<DiagnosticImage, UUID> {
    List<DiagnosticImage> findByConsultation(ClinicalConsultation consultation);

    List<DiagnosticImage> findByConsultationPatientIdOrderByCreatedAtDesc(UUID patientId);
}

