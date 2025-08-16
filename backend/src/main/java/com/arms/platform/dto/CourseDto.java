package com.arms.platform.dto;

import java.time.LocalDateTime;

public class CourseDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String color;
    private LocalDateTime createdAt;
    private int materialCount;
    private int studentCount;
    private int notificationCount;
    
    // Constructors
    public CourseDto() {}
    
    public CourseDto(Long id, String code, String name, String description, String color, LocalDateTime createdAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.color = color;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public int getMaterialCount() { return materialCount; }
    public void setMaterialCount(int materialCount) { this.materialCount = materialCount; }
    
    public int getStudentCount() { return studentCount; }
    public void setStudentCount(int studentCount) { this.studentCount = studentCount; }
    
    public int getNotificationCount() { return notificationCount; }
    public void setNotificationCount(int notificationCount) { this.notificationCount = notificationCount; }
}
