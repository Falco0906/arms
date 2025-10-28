package com.arms.platform.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @Value("${firebase.project.id:}")
    private String projectId;

    @Value("${firebase.storage.bucket:}")
    private String storageBucket;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder();

                // Try to load credentials from file if path is provided
                if (credentialsPath != null && !credentialsPath.isEmpty()) {
                    FileInputStream serviceAccount = new FileInputStream(credentialsPath);
                    optionsBuilder.setCredentials(GoogleCredentials.fromStream(serviceAccount));
                } else {
                    // Use application default credentials (for Cloud Run, App Engine, etc.)
                    optionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault());
                }

                // Set project ID if provided
                if (projectId != null && !projectId.isEmpty()) {
                    optionsBuilder.setProjectId(projectId);
                }

                // Set storage bucket if provided
                if (storageBucket != null && !storageBucket.isEmpty()) {
                    optionsBuilder.setStorageBucket(storageBucket);
                }

                FirebaseApp.initializeApp(optionsBuilder.build());
                System.out.println("Firebase initialized successfully!");
            }
        } catch (IOException e) {
            System.err.println("Failed to initialize Firebase: " + e.getMessage());
            System.err.println("Firebase features will be disabled. Set firebase.credentials.path in application.properties");
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return FirebaseAuth.getInstance();
            }
        } catch (Exception e) {
            System.err.println("FirebaseAuth bean creation failed: " + e.getMessage());
        }
        return null;
    }

    @Bean
    public Firestore firestore() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return FirestoreClient.getFirestore();
            }
        } catch (Exception e) {
            System.err.println("Firestore bean creation failed: " + e.getMessage());
        }
        return null;
    }

    @Bean
    public Storage firebaseStorage() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return StorageOptions.getDefaultInstance().getService();
            }
        } catch (Exception e) {
            System.err.println("Storage bean creation failed: " + e.getMessage());
        }
        return null;
    }
}
