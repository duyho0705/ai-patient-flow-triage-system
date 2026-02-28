package vn.clinic.cdm.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Cloudinary cloudinary;

    public FileStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String saveAvatar(MultipartFile file, UUID patientId) {
        return uploadToCloudinary(file, "avatars",
                "avatar_" + patientId + "_" + UUID.randomUUID().toString().substring(0, 8));
    }

    public String saveVitalImage(MultipartFile file, UUID patientId) {
        return uploadToCloudinary(file, "vitals", "vital_" + patientId + "_" + System.currentTimeMillis());
    }

    public String saveChatFile(MultipartFile file, UUID patientId) {
        return uploadToCloudinary(file, "chat", "chat_" + patientId + "_" + System.currentTimeMillis());
    }

    private String uploadToCloudinary(MultipartFile file, String folder, String publicId) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "public_id", publicId,
                    "resource_type", "auto" // Automatically detect image vs raw file (like pdf)
            ));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Could not store the file to Cloudinary. Error: " + e.getMessage());
        }
    }
}

