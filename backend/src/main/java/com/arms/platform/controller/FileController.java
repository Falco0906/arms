package com.arms.platform.controller;

// TODO: Fix import errors if these packages do not exist or are incorrect
import com.arms.platform.dto.FileInfo;
import com.arms.platform.dto.FileUploadResponse;
import com.arms.platform.material.MaterialType;
import com.arms.platform.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Upload a file to a specific course
     * POST /api/materials/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId,
            @RequestParam("uploaderId") Long uploaderId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("category") MaterialType category) {
        
        try {
            FileUploadResponse response = fileStorageService.uploadFile(
                file, courseId, uploaderId, description, category);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }
    
    /**
     * Get all materials for a specific course
     * GET /api/materials/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<FileInfo>> getCourseFiles(@PathVariable Long courseId) {
        try {
            List<FileInfo> files = fileStorageService.getFilesByCourse(courseId);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Download a file by ID
     * GET /api/materials/{id}/download
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        try {
            Resource resource = fileStorageService.getFileAsResource(id);
            
            // Get the file name for the response header
            String filename = resource.getFilename();
            if (filename == null) {
                filename = "download";
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=\"" + filename + "\"")
                .body(resource);
                
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * View/Preview a file by ID
     * GET /api/materials/{id}/view
     */
    @GetMapping("/{id}/view")
    public ResponseEntity<Resource> viewFile(@PathVariable Long id) {
        try {
            Resource resource = fileStorageService.getFileAsResource(id);
            
            String filename = resource.getFilename();
            if (filename == null) {
                filename = "preview";
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "inline; filename=\"" + filename + "\"")
                .body(resource);
                
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Search materials in a course
     * GET /api/materials/course/{courseId}/search?q=searchTerm
     */
    @GetMapping("/course/{courseId}/search")
    public ResponseEntity<List<FileInfo>> searchFiles(
            @PathVariable Long courseId,
            @RequestParam("q") String searchTerm) {
        
        try {
            List<FileInfo> files = fileStorageService.searchFiles(courseId, searchTerm);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get materials by category
     * GET /api/materials/course/{courseId}/category/{category}
     */
    @GetMapping("/course/{courseId}/category/{category}")
    public ResponseEntity<List<FileInfo>> getFilesByCategory(
            @PathVariable Long courseId,
            @PathVariable MaterialType category) {
        
        try {
            List<FileInfo> files = fileStorageService.getFilesByCategory(courseId, category);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get storage statistics for a course
     * GET /api/materials/course/{courseId}/stats
     */
    @GetMapping("/course/{courseId}/stats")
    public ResponseEntity<Map<String, Object>> getCourseStats(@PathVariable Long courseId) {
        try {
            long fileCount = fileStorageService.getFileCountByCourse(courseId);
            long totalSize = fileStorageService.getTotalSizeByCourse(courseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileCount", fileCount);
            response.put("totalSize", totalSize);
            response.put("formattedSize", formatFileSize(totalSize));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024) + " KB";
        return (bytes / (1024 * 1024)) + " MB";
    }
}

