package vn.clinic.patientflow.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.clinical.domain.Prescription;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findByPatientId(UUID patientId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "items", "consultation",
            "consultation.patient", "items.product" })
    List<Prescription> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "items", "consultation",
            "consultation.patient", "items.product" })
    Optional<Prescription> findByConsultationId(UUID consultationId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "items", "consultation",
            "consultation.patient", "items.product" })
    List<Prescription> findByStatusAndConsultationBranchIdOrderByCreatedAtDesc(
            Prescription.PrescriptionStatus status, UUID branchId);
}
