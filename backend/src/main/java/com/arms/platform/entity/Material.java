package com.arms.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String contentType; // notes, assignment, code, presentation, document
    
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
    
    @ManyToOne
    @JoinColumn(name = "uploader_id")
    private User uploader;
    
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    
    @Column(name = "download_count")
    private int downloadCount = 0;
    
    // Constructors
    public Material() {
        this.uploadedAt = LocalDateTime.now();
    }
    
    public Material(String title, String description, String fileUrl, String fileName, 
                   String fileType, Long fileSize, String contentType, Course course, User uploader) {
        this();
        this.title = title;
        this.description = description;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.course = course;
        this.uploader = uploader;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    
    public User getUploader() { return uploader; }
    public void setUploader(User uploader) { this.uploader = uploader; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    public int getDownloadCount() { return downloadCount; }
    public void setDownloadCount(int downloadCount) { this.downloadCount = downloadCount; }
}
