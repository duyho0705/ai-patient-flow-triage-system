package vn.clinic.patientflow.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.clinical.domain.DiagnosticImage;

import java.util.List;
import java.util.UUID;

public interface DiagnosticImageRepository extends JpaRepository<DiagnosticImage, UUID> {
    List<DiagnosticImage> findByConsultation(ClinicalConsultation consultation);

    List<DiagnosticImage> findByConsultationPatientIdOrderByCreatedAtDesc(UUID patientId);
}
