package vn.clinic.cdm.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.config.path:}")
    private String configPath;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions options;

                if (configPath != null && !configPath.isEmpty()) {
                    InputStream serviceAccount;
                    if (configPath.startsWith("classpath:")) {
                        serviceAccount = new org.springframework.core.io.ClassPathResource(configPath.substring(10))
                                .getInputStream();
                    } else {
                        serviceAccount = new FileInputStream(configPath);
                    }
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                    log.info("Initializing Firebase with config from: {}", configPath);
                } else {
                    // Fallback to default credentials (e.g., from environment variable
                    // GOOGLE_APPLICATION_CREDENTIALS)
                    // Or initialize with dummy for dev if no creds present to avoid crash
                    try {
                        options = FirebaseOptions.builder()
                                .setCredentials(GoogleCredentials.getApplicationDefault())
                                .build();
                        log.info("Initializing Firebase with Application Default Credentials");
                    } catch (IOException e) {
                        log.warn("Firebase credentials not found. FCM notifications will be disabled. Error: {}",
                                e.getMessage());
                        return;
                    }
                }

                FirebaseApp.initializeApp(options);
                log.info("Firebase Application has been initialized");
            }
        } catch (IOException e) {
            log.error("Error initializing Firebase: {}", e.getMessage());
        }
    }
}

