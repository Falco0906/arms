package com.arms.platform.user;

import com.arms.platform.material.Material;
import com.arms.platform.material.MaterialRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final MaterialRepository materialRepository;
    
    public UserController(UserRepository userRepository, MaterialRepository materialRepository) {
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Get user's materials grouped by course
        List<Material> userMaterials = materialRepository.findByUserId(id);
        
        // Group materials by course
        Map<String, List<Material>> materialsByCourse = userMaterials.stream()
            .collect(Collectors.groupingBy(material -> 
                material.getCourse().getCode() + " - " + material.getCourse().getTitle()
            ));
        
        // Calculate statistics
        long totalUploads = userMaterials.size();
        long notesCount = userMaterials.stream().filter(m -> m.getType().name().equals("NOTES")).count();
        long assignmentsCount = userMaterials.stream().filter(m -> m.getType().name().equals("ASSIGNMENT")).count();
        long codeCount = userMaterials.stream().filter(m -> m.getType().name().equals("CODE")).count();
        long presentationsCount = userMaterials.stream().filter(m -> m.getType().name().equals("PPT")).count();
        long documentsCount = userMaterials.stream().filter(m -> m.getType().name().equals("DOC")).count();
        long otherCount = userMaterials.stream().filter(m -> m.getType().name().equals("OTHER")).count();
        
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "totalUploads", totalUploads,
            "materialsByCourse", materialsByCourse,
            "statistics", Map.of(
                "notes", notesCount,
                "assignments", assignmentsCount,
                "code", codeCount,
                "presentations", presentationsCount,
                "documents", documentsCount,
                "other", otherCount
            )
        ));
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        List<User> users = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
        
        List<Map<String, Object>> userList = users.stream()
            .map(user -> {
                Map<String, Object> userMap = new java.util.HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("email", user.getEmail());
                userMap.put("role", user.getRole());
                return userMap;
            })
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(userList);
    }
}
