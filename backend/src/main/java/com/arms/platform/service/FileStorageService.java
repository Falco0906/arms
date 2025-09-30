package com.arms.platform.service;

import com.arms.platform.dto.FileInfo;
import com.arms.platform.dto.FileUploadResponse;
import com.arms.platform.material.Material;
import com.arms.platform.material.MaterialType;
import com.arms.platform.material.MaterialRepository;
import com.arms.platform.course.Course;
import com.arms.platform.course.CourseRepository;
import com.arms.platform.user.User;
import com.arms.platform.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class FileStorageService {
    
    @Autowired
    private MaterialRepository materialRepository;
    
    @Autowired 
    private CourseRepository courseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    public FileUploadResponse uploadFile(MultipartFile file, Long courseId, Long uploaderId, 
                                       String description, MaterialType materialType) {
        
        validateFile(file);
        
        try {
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
            User user = userRepository.findById(uploaderId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Create upload directory
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String uniqueFilename = generateUniqueFilename(originalFilename);
            String relativePath = "materials/" + courseId + "/" + uniqueFilename;
            
            Path coursePath = uploadPath.resolve("materials").resolve(courseId.toString());
            Files.createDirectories(coursePath);
            
            Path filePath = coursePath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            Material material = new Material();
            material.setCourse(course);
            material.setUser(user);
            material.setTitle(originalFilename);
            material.setType(materialType);
            material.setPath(relativePath);
            material.setSize(file.getSize());
            material.setOriginalFilename(originalFilename);
            material.setFileType(file.getContentType());
            material.setDescription(description);
            // Also store bytes in DB for BYTEA storage if desired
            try {
                material.setContent(file.getBytes());
            } catch (IOException ignored) {}
            
            Material savedMaterial = materialRepository.save(material);
            
            String downloadUrl = "/api/materials/" + savedMaterial.getId() + "/download";
            
            return new FileUploadResponse(
                savedMaterial.getId(),
                "File uploaded successfully",
                uniqueFilename,
                savedMaterial.getFileType(),
                savedMaterial.getSize(),
                downloadUrl
            );
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
        }
    }
    
    public Resource getFileAsResource(Long fileId) {
        try {
            Material material = materialRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
            // Prefer DB content if present
            if (material.getContent() != null && material.getContent().length > 0) {
                material.setDownloadCount(material.getDownloadCount() + 1);
                materialRepository.save(material);
                return new org.springframework.core.io.ByteArrayResource(material.getContent()) {
                    @Override
                    public String getFilename() { return material.getOriginalFilename(); }
                };
            }
            // Fallback to filesystem path
            Path filePath = Paths.get(uploadDir).resolve(material.getPath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                material.setDownloadCount(material.getDownloadCount() + 1);
                materialRepository.save(material);
                return resource;
            }
            throw new RuntimeException("File not found");
        } catch (IOException e) {
            throw new RuntimeException("Error reading file", e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<FileInfo> getFilesByCourse(Long courseId) {
        List<Material> materials = materialRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
        return materials.stream()
            .map(this::convertToFileInfo)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FileInfo> searchFiles(Long courseId, String searchTerm) {
        List<Material> materials = materialRepository.searchMaterialsInCourse(courseId, searchTerm);
        return materials.stream()
            .map(this::convertToFileInfo)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FileInfo> getFilesByCategory(Long courseId, MaterialType category) {
        List<Material> materials = materialRepository.findByCourseIdAndTypeOrderByCreatedAtDesc(courseId, category);
        return materials.stream()
            .map(this::convertToFileInfo)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public long getFileCountByCourse(Long courseId) {
        return materialRepository.countByCourseId(courseId);
    }
    
    @Transactional(readOnly = true)
    public long getTotalSizeByCourse(Long courseId) {
        return materialRepository.getTotalSizeByCourseId(courseId);
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot upload empty file");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 50MB limit");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || filename.contains("..")) {
            throw new RuntimeException("Invalid filename: " + filename);
        }
    }
    
    private String generateUniqueFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return baseName + "_" + uuid + extension;
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
    
    private FileInfo convertToFileInfo(Material material) {
        return new FileInfo(
            material.getId(),
            material.getTitle(),
            material.getOriginalFilename(),
            material.getFileType(),
            material.getSize(),
            material.getUser().getId(),
            material.getUser().getName(),
            material.getCreatedAt(),
            material.getDescription(),
            material.getType(),
            "/api/materials/" + material.getId() + "/download"
        );
    }
}
