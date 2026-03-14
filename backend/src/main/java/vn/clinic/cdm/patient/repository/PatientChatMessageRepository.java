package vn.clinic.cdm.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.patient.domain.PatientChatMessage;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientChatMessageRepository extends JpaRepository<PatientChatMessage, UUID> {
    List<PatientChatMessage> findByConversationIdOrderBySentAtAsc(UUID conversationId);

    @org.springframework.data.jpa.repository.Query("""
        SELECT COUNT(m) FROM PatientChatMessage m
        WHERE m.conversation.doctorUser.id = :doctorUserId
          AND m.senderType = 'PATIENT'
          AND m.readAt IS NULL
    """)
    long countUnreadForDoctor(@org.springframework.data.repository.query.Param("doctorUserId") UUID doctorUserId);

    @org.springframework.data.jpa.repository.Query("""
        SELECT m FROM PatientChatMessage m
        WHERE m.conversation.doctorUser.id = :doctorUserId
          AND m.senderType = 'PATIENT'
          AND m.readAt IS NULL
        ORDER BY m.sentAt DESC
    """)
    List<PatientChatMessage> findUnreadForDoctor(@org.springframework.data.repository.query.Param("doctorUserId") UUID doctorUserId);
}

