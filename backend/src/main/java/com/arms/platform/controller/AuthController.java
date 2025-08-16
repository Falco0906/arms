package com.oops.platform.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        // TODO: Implement actual authentication
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        // Mock response for now
        Map<String, Object> response = new HashMap<>();
        response.put("token", "mock-jwt-token-123");
        response.put("user", Map.of(
            "id", 1,
            "email", email,
            "firstName", "John",
            "lastName", "Doe",
            "role", "STUDENT"
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        // TODO: Implement user registration
        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        // TODO: Implement get current user
        Map<String, Object> user = Map.of(
            "id", 1,
            "email", "john@university.edu",
            "firstName", "John",
            "lastName", "Doe",
            "role", "STUDENT"
        );
        return ResponseEntity.ok(user);
    }
}