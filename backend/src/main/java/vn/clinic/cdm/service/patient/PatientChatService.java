package vn.clinic.cdm.service.patient;

import org.springframework.web.multipart.MultipartFile;
import vn.clinic.cdm.dto.clinical.DoctorInfoDto;
import vn.clinic.cdm.dto.messaging.PatientChatConversationDto;
import vn.clinic.cdm.dto.messaging.PatientChatMessageDto;
import vn.clinic.cdm.entity.patient.Patient;

import java.util.List;
import java.util.UUID;

public interface PatientChatService {
    List<DoctorInfoDto> getAvailableDoctors();
    List<PatientChatMessageDto> getChatHistory(Patient patient, UUID doctorUserId);
    PatientChatMessageDto sendMessage(Patient patient, UUID doctorUserId, String content);
    PatientChatMessageDto sendMessageWithFile(Patient patient, UUID doctorUserId, String content, MultipartFile file);
    List<PatientChatConversationDto> getDoctorConversations(UUID doctorUserId);
    PatientChatMessageDto doctorSendMessage(UUID doctorUserId, UUID patientId, String content);
    PatientChatMessageDto doctorSendMessageWithFile(UUID doctorUserId, UUID patientId, String content, MultipartFile file);
    long getUnreadCountForDoctor(UUID doctorUserId);
    List<PatientChatMessageDto> getUnreadMessagesForDoctor(UUID doctorUserId);
}
