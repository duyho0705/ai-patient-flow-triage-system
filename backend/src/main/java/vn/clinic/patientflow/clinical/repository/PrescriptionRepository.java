package vn.clinic.patientflow.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.clinical.domain.Prescription;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findByPatientId(UUID patientId);

    List<Prescription> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    Optional<Prescription> findByConsultationId(UUID consultationId);

    List<Prescription> findByStatusAndConsultationBranchIdOrderByCreatedAtDesc(
            Prescription.PrescriptionStatus status, UUID branchId);
}
