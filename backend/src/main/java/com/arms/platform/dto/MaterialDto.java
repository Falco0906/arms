package com.arms.platform.dto;

import java.time.LocalDateTime;

public class MaterialDto {
    private Long id;
    private String title;
    private String description;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String contentType;
    private CourseDto course;
    private UserDto uploader;
    private LocalDateTime uploadedAt;
    private int downloadCount;
    
    // Constructors
    public MaterialDto() {}
    
    public MaterialDto(Long id, String title, String description, String fileUrl, String fileName,
                      String fileType, Long fileSize, String contentType, CourseDto course,
                      UserDto uploader, LocalDateTime uploadedAt, int downloadCount) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.course = course;
        this.uploader = uploader;
        this.uploadedAt = uploadedAt;
        this.downloadCount = downloadCount;
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
    
    public CourseDto getCourse() { return course; }
    public void setCourse(CourseDto course) { this.course = course; }
    
    public UserDto getUploader() { return uploader; }
    public void setUploader(UserDto uploader) { this.uploader = uploader; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    public int getDownloadCount() { return downloadCount; }
    public void setDownloadCount(int downloadCount) { this.downloadCount = downloadCount; }
}
