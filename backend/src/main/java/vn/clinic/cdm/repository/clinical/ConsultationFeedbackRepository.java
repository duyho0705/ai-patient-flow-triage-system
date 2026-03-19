package vn.clinic.cdm.repository.clinical;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.clinical.ConsultationFeedback;

import java.util.Optional;
import java.util.UUID;

public interface ConsultationFeedbackRepository extends JpaRepository<ConsultationFeedback, UUID> {
    Optional<ConsultationFeedback> findByConsultationId(UUID consultationId);
}

