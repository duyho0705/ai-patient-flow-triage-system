package vn.clinic.patientflow.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root;

    public FileStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.root = Paths.get(uploadDir);
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    public String saveAvatar(MultipartFile file, UUID patientId) {
        try {
            String extension = getFileExtension(file.getOriginalFilename());
            String filename = "avatar_" + patientId + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return "/uploads/" + filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    public String saveVitalImage(MultipartFile file, UUID patientId) {
        try {
            String extension = getFileExtension(file.getOriginalFilename());
            String filename = "vital_" + patientId + "_" + System.currentTimeMillis() + extension;
            Path vitalsDir = this.root.resolve("vitals");
            Files.createDirectories(vitalsDir);
            Files.copy(file.getInputStream(), vitalsDir.resolve(filename));
            return "/uploads/vitals/" + filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the vital image. Error: " + e.getMessage());
        }
    }

    public String saveChatFile(MultipartFile file, UUID patientId) {
        try {
            String extension = getFileExtension(file.getOriginalFilename());
            String filename = "chat_" + patientId + "_" + System.currentTimeMillis() + extension;
            Path chatDir = this.root.resolve("chat");
            Files.createDirectories(chatDir);
            Files.copy(file.getInputStream(), chatDir.resolve(filename));
            return "/uploads/chat/" + filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the chat file. Error: " + e.getMessage());
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null)
            return ".png";
        int lastIndex = fileName.lastIndexOf('.');
        return lastIndex == -1 ? ".png" : fileName.substring(lastIndex);
    }
}
