package com.arms.platform.api;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Main API Controller for ARMS Platform
 * Demonstrates Java OOP principles with Spring Boot and Firebase integration
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirebaseAuth firebaseAuth;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "ARMS Platform Backend");
        response.put("version", "2.0.0");
        response.put("firebase", firestore != null ? "connected" : "not configured");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * API information endpoint
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "ARMS Platform API");
        response.put("description", "Academic Resource Management System");
        response.put("version", "2.0.0");
        response.put("backend", "Java Spring Boot");
        response.put("database", "Firebase Firestore");
        response.put("storage", "Firebase Storage");
        response.put("authentication", "Firebase Auth");
        return ResponseEntity.ok(response);
    }

    /**
     * Verify Firebase token (demonstrates authentication integration)
     */
    @PostMapping("/verify-token")
    public ResponseEntity<Map<String, Object>> verifyToken(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        if (firebaseAuth == null) {
            response.put("error", "Firebase not configured");
            return ResponseEntity.status(503).body(response);
        }

        try {
            String idToken = request.get("idToken");
            if (idToken == null || idToken.isEmpty()) {
                response.put("error", "Token is required");
                return ResponseEntity.badRequest().body(response);
            }

            var decodedToken = firebaseAuth.verifyIdToken(idToken);
            response.put("valid", true);
            response.put("uid", decodedToken.getUid());
            response.put("email", decodedToken.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("valid", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * Get system statistics (demonstrates data aggregation)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> response = new HashMap<>();
        
        if (firestore == null) {
            response.put("error", "Firebase not configured");
            return ResponseEntity.status(503).body(response);
        }

        try {
            // Get collection counts
            int usersCount = firestore.collection("users").listDocuments().spliterator().getExactSizeIfKnown() != -1 ? 
                (int) firestore.collection("users").listDocuments().spliterator().getExactSizeIfKnown() : 0;
            int coursesCount = firestore.collection("courses").listDocuments().spliterator().getExactSizeIfKnown() != -1 ?
                (int) firestore.collection("courses").listDocuments().spliterator().getExactSizeIfKnown() : 0;
            int materialsCount = firestore.collection("materials").listDocuments().spliterator().getExactSizeIfKnown() != -1 ?
                (int) firestore.collection("materials").listDocuments().spliterator().getExactSizeIfKnown() : 0;

            response.put("users", usersCount);
            response.put("courses", coursesCount);
            response.put("materials", materialsCount);
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
