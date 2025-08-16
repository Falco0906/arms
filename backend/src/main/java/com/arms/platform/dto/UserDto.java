package com.arms.platform.dto;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private int uploadCount;
    private LocalDateTime createdAt;
    
    // Constructors
    public UserDto() {}
    
    public UserDto(Long id, String email, String firstName, String lastName, String role, int uploadCount, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.uploadCount = uploadCount;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public int getUploadCount() { return uploadCount; }
    public void setUploadCount(int uploadCount) { this.uploadCount = uploadCount; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
