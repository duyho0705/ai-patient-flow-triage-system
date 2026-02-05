package vn.clinic.patientflow.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.api.dto.DoctorInfoDto;
import vn.clinic.patientflow.api.dto.PatientChatMessageDto;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.repository.IdentityUserRepository;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.domain.PatientChatConversation;
import vn.clinic.patientflow.patient.domain.PatientChatMessage;
import vn.clinic.patientflow.patient.repository.PatientChatConversationRepository;
import vn.clinic.patientflow.patient.repository.PatientChatMessageRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientChatService {

    private final PatientChatConversationRepository conversationRepository;
    private final PatientChatMessageRepository messageRepository;
    private final IdentityUserRepository identityUserRepository;

    @Transactional(readOnly = true)
    public List<DoctorInfoDto> getAvailableDoctors() {
        // Mocking: return some users with DOCTOR role
        // In real app, you would query identityUserRoleRepository for DOCTOR role
        return identityUserRepository.findAll().stream()
                .limit(5)
                .map(u -> DoctorInfoDto.builder()
                        .id(u.getId())
                        .name(u.getFullNameVi() != null ? u.getFullNameVi() : u.getEmail())
                        .specialty("Chuyên khoa Nội")
                        .avatar(u.getFullNameVi() != null ? u.getFullNameVi().substring(0, 1) : "D")
                        .online(true)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PatientChatMessageDto> getChatHistory(Patient patient, UUID doctorUserId) {
        var conv = getOrCreateConversation(patient, doctorUserId);
        return messageRepository.findByConversationIdOrderBySentAtAsc(conv.getId()).stream()
                .map(m -> PatientChatMessageDto.builder()
                        .id(m.getId())
                        .senderType(m.getSenderType())
                        .content(m.getContent())
                        .sentAt(m.getSentAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientChatMessageDto sendMessage(Patient patient, UUID doctorUserId, String content) {
        var conv = getOrCreateConversation(patient, doctorUserId);

        PatientChatMessage msg = PatientChatMessage.builder()
                .conversation(conv)
                .senderType("PATIENT")
                .content(content)
                .sentAt(Instant.now())
                .build();

        messageRepository.save(msg);

        return PatientChatMessageDto.builder()
                .id(msg.getId())
                .senderType(msg.getSenderType())
                .content(msg.getContent())
                .sentAt(msg.getSentAt())
                .build();
    }

    private PatientChatConversation getOrCreateConversation(Patient patient, UUID doctorUserId) {
        return conversationRepository.findByPatientIdAndDoctorUserIdAndStatus(patient.getId(), doctorUserId, "ACTIVE")
                .orElseGet(() -> {
                    IdentityUser doctor = identityUserRepository.findById(doctorUserId)
                            .orElseThrow(() -> new RuntimeException("Doctor not found"));

                    PatientChatConversation newConv = PatientChatConversation.builder()
                            .patient(patient)
                            .doctorUser(doctor)
                            .status("ACTIVE")
                            .createdAt(Instant.now())
                            .build();
                    return conversationRepository.save(newConv);
                });
    }
}
