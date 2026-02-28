package vn.clinic.cdm.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.clinical.domain.ConsultationFeedback;

import java.util.Optional;
import java.util.UUID;

public interface ConsultationFeedbackRepository extends JpaRepository<ConsultationFeedback, UUID> {
    Optional<ConsultationFeedback> findByConsultationId(UUID consultationId);
}

