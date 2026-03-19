package vn.clinic.cdm.service.common;

import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

public interface FileStorageService {
    String saveAvatar(MultipartFile file, UUID patientId);
    
    String saveVitalImage(MultipartFile file, UUID patientId);
    
    String saveChatFile(MultipartFile file, UUID patientId);
}
