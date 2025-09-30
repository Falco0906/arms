package com.arms.platform.dto;

import com.arms.platform.material.MaterialType;
import java.time.Instant;

public class FileInfo {
    private Long id;
    private String filename;
    private String originalFilename;
    private String fileType;
    private Long fileSize;
    private Long uploaderId;
    private String uploaderName;
    private Instant uploadTimestamp;
    private String description;
    private MaterialType category;
    private String downloadUrl;
    
    public FileInfo() {}
    
    public FileInfo(Long id, String filename, String originalFilename, String fileType, 
                   Long fileSize, Long uploaderId, String uploaderName, 
                   Instant uploadTimestamp, String description, 
                   MaterialType category, String downloadUrl) {
        this.id = id;
        this.filename = filename;
        this.originalFilename = originalFilename;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploaderId = uploaderId;
        this.uploaderName = uploaderName;
        this.uploadTimestamp = uploadTimestamp;
        this.description = description;
        this.category = category;
        this.downloadUrl = downloadUrl;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public Long getUploaderId() { return uploaderId; }
    public void setUploaderId(Long uploaderId) { this.uploaderId = uploaderId; }
    
    public String getUploaderName() { return uploaderName; }
    public void setUploaderName(String uploaderName) { this.uploaderName = uploaderName; }
    
    public Instant getUploadTimestamp() { return uploadTimestamp; }
    public void setUploadTimestamp(Instant uploadTimestamp) { this.uploadTimestamp = uploadTimestamp; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public MaterialType getCategory() { return category; }
    public void setCategory(MaterialType category) { this.category = category; }
    
    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
}
