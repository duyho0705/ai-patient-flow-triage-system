package vn.clinic.cdm.repository.clinical;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.clinical.ClinicalConsultation;
import vn.clinic.cdm.entity.clinical.DiagnosticImage;

import java.util.List;
import java.util.UUID;

public interface DiagnosticImageRepository extends JpaRepository<DiagnosticImage, UUID> {
    List<DiagnosticImage> findByConsultation(ClinicalConsultation consultation);

    List<DiagnosticImage> findByConsultationPatientIdOrderByCreatedAtDesc(UUID patientId);
}

