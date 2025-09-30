package com.arms.platform.dto;

public class FileUploadResponse {
    private Long fileId;
    private String message;
    private String filename;
    private String fileType;
    private Long fileSize;
    private String downloadUrl;
    
    public FileUploadResponse() {}
    
    public FileUploadResponse(Long fileId, String message, String filename, 
                            String fileType, Long fileSize, String downloadUrl) {
        this.fileId = fileId;
        this.message = message;
        this.filename = filename;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.downloadUrl = downloadUrl;
    }
    
    // Getters and setters
    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
}
