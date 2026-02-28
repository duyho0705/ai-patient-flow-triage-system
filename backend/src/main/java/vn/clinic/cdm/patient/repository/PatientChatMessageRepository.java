package vn.clinic.cdm.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.patient.domain.PatientChatMessage;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientChatMessageRepository extends JpaRepository<PatientChatMessage, UUID> {
    List<PatientChatMessage> findByConversationIdOrderBySentAtAsc(UUID conversationId);
}

