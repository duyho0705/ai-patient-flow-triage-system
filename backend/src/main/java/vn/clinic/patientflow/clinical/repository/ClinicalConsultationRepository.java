package vn.clinic.patientflow.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;

import java.util.UUID;

public interface ClinicalConsultationRepository extends JpaRepository<ClinicalConsultation, UUID> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "patient", "queueEntry",
            "queueEntry.triageSession", "doctorUser" })
    java.util.List<ClinicalConsultation> findByPatientIdOrderByStartedAtDesc(UUID patientId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "patient", "queueEntry",
            "queueEntry.triageSession", "doctorUser" })
    java.util.List<ClinicalConsultation> findTop5ByPatientIdOrderByStartedAtDesc(UUID patientId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "patient", "queueEntry",
            "queueEntry.triageSession", "doctorUser" })
    org.springframework.data.domain.Page<ClinicalConsultation> findByPatientIdOrderByStartedAtDesc(UUID patientId,
            org.springframework.data.domain.Pageable pageable);
}
