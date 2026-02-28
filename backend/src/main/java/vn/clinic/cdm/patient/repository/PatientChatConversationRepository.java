package vn.clinic.cdm.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.patient.domain.PatientChatConversation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientChatConversationRepository extends JpaRepository<PatientChatConversation, UUID> {
    List<PatientChatConversation> findByPatientId(UUID patientId);

    List<PatientChatConversation> findByDoctorUserId(UUID doctorUserId);

    Optional<PatientChatConversation> findByPatientIdAndDoctorUserIdAndStatus(UUID patientId, UUID doctorUserId,
            String status);
}

