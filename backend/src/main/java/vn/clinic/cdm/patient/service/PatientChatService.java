package vn.clinic.cdm.patient.service;

import vn.clinic.cdm.api.dto.messaging.PatientChatConversationDto;
import vn.clinic.cdm.patient.repository.PatientRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.clinic.cdm.api.dto.clinical.DoctorInfoDto;
import vn.clinic.cdm.api.dto.messaging.PatientChatMessageDto;
import vn.clinic.cdm.common.service.FileStorageService;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.identity.repository.IdentityUserRepository;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.domain.PatientChatConversation;
import vn.clinic.cdm.patient.domain.PatientChatMessage;
import vn.clinic.cdm.patient.repository.PatientChatConversationRepository;
import vn.clinic.cdm.patient.repository.PatientChatMessageRepository;
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
        private final PatientRepository patientRepository;
        private final FileStorageService fileStorageService;

        @Transactional(readOnly = true)
        public List<DoctorInfoDto> getAvailableDoctors() {
                UUID tenantId = vn.clinic.cdm.common.tenant.TenantContext.getTenantIdOrThrow();
                return identityUserRepository.findByTenantIdAndRoleCode(tenantId, "DOCTOR").stream()
                                .map(u -> DoctorInfoDto.builder()
                                                .id(u.getId())
                                                .name(u.getFullNameVi() != null ? u.getFullNameVi() : u.getEmail())
                                                .specialty("ChuyÃªn khoa Ná»™i")
                                                .avatar(u.getFullNameVi() != null ? u.getFullNameVi().substring(0, 1)
                                                                : "D")
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
                                                .fileUrl(m.getFileUrl())
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

        @Transactional
        public PatientChatMessageDto sendMessageWithFile(Patient patient, UUID doctorUserId, String content,
                        MultipartFile file) {
                var conv = getOrCreateConversation(patient, doctorUserId);

                String fileUrl = null;
                if (file != null && !file.isEmpty()) {
                        fileUrl = fileStorageService.saveChatFile(file, patient.getId());
                }

                PatientChatMessage msg = PatientChatMessage.builder()
                                .conversation(conv)
                                .senderType("PATIENT")
                                .content(content != null ? content : "ðŸ“Ž File Ä‘Ã­nh kÃ¨m")
                                .sentAt(Instant.now())
                                .fileUrl(fileUrl)
                                .build();

                messageRepository.save(msg);

                return PatientChatMessageDto.builder()
                                .id(msg.getId())
                                .senderType(msg.getSenderType())
                                .content(msg.getContent())
                                .sentAt(msg.getSentAt())
                                .fileUrl(msg.getFileUrl())
                                .build();
        }

        private PatientChatConversation getOrCreateConversation(Patient patient, UUID doctorUserId) {
                return conversationRepository
                                .findByPatientIdAndDoctorUserIdAndStatus(patient.getId(), doctorUserId, "ACTIVE")
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

        @Transactional(readOnly = true)
        public List<PatientChatConversationDto> getDoctorConversations(UUID doctorUserId) {
                return conversationRepository.findByDoctorUserId(doctorUserId).stream()
                                .map(c -> PatientChatConversationDto.builder()
                                                .id(c.getId())
                                                .patientId(c.getPatient().getId())
                                                .patientName(c.getPatient().getFullNameVi())
                                                .status(c.getStatus())
                                                .lastMessageAt(c.getCreatedAt())
                                                .build())
                                .collect(Collectors.toList());
        }

        @Transactional
        public PatientChatMessageDto doctorSendMessage(UUID doctorUserId, UUID patientId, String content) {
                Patient patient = patientRepository.findById(patientId)
                                .orElseThrow(() -> new RuntimeException("Patient not found"));
                var conv = getOrCreateConversation(patient, doctorUserId);

                PatientChatMessage msg = PatientChatMessage.builder()
                                .conversation(conv)
                                .senderType("DOCTOR")
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
}

