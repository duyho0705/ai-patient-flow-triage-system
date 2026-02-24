package vn.clinic.patientflow.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.clinical.domain.ConsultationFeedback;

import java.util.Optional;
import java.util.UUID;

public interface ConsultationFeedbackRepository extends JpaRepository<ConsultationFeedback, UUID> {
    Optional<ConsultationFeedback> findByConsultationId(UUID consultationId);
}
