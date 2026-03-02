package vn.clinic.cdm.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Cloudinary cloudinary;
    private final boolean cloudinaryConfigured;

    // Local fallback directory
    private static final String LOCAL_UPLOAD_DIR = "uploads";

    public FileStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
        // Check if Cloudinary is actually configured with real credentials
        String apiKey = (String) cloudinary.config.apiKey;
        this.cloudinaryConfigured = apiKey != null
                && !apiKey.isBlank()
                && !apiKey.startsWith("your_");
        if (!cloudinaryConfigured) {
            log.warn("Cloudinary API key not configured. File uploads will be saved locally.");
            try {
                Files.createDirectories(Paths.get(LOCAL_UPLOAD_DIR));
            } catch (IOException e) {
                log.error("Could not create local upload directory", e);
            }
        }
    }

    public String saveAvatar(MultipartFile file, UUID patientId) {
        String filename = "avatar_" + patientId + "_" + UUID.randomUUID().toString().substring(0, 8);
        if (cloudinaryConfigured) {
            return uploadToCloudinary(file, "avatars", filename);
        }
        return saveLocally(file, "avatars", filename);
    }

    public String saveVitalImage(MultipartFile file, UUID patientId) {
        String filename = "vital_" + patientId + "_" + System.currentTimeMillis();
        if (cloudinaryConfigured) {
            return uploadToCloudinary(file, "vitals", filename);
        }
        return saveLocally(file, "vitals", filename);
    }

    public String saveChatFile(MultipartFile file, UUID patientId) {
        String filename = "chat_" + patientId + "_" + System.currentTimeMillis();
        if (cloudinaryConfigured) {
            return uploadToCloudinary(file, "chat", filename);
        }
        return saveLocally(file, "chat", filename);
    }

    private String uploadToCloudinary(MultipartFile file, String folder, String publicId) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "public_id", publicId,
                    "resource_type", "auto"));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Could not store the file to Cloudinary. Error: " + e.getMessage());
        }
    }

    private String saveLocally(MultipartFile file, String folder, String filename) {
        try {
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            Path dir = Paths.get(LOCAL_UPLOAD_DIR, folder);
            Files.createDirectories(dir);
            Path filePath = dir.resolve(filename + extension);
            Files.write(filePath, file.getBytes());
            // Return a URL that the frontend can use
            String url = "/uploads/" + folder + "/" + filename + extension;
            log.info("File saved locally: {}", url);
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Could not save file locally. Error: " + e.getMessage());
        }
    }
}
