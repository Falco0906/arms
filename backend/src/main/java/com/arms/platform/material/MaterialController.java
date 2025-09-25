package com.arms.platform.material;

import com.arms.platform.user.User;
import com.arms.platform.dto.MaterialDto;
import com.arms.platform.dto.UserDto;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class MaterialController {
  private final MaterialService service;
  private final MaterialRepository repo;

  public MaterialController(MaterialService service, MaterialRepository repo){
    this.service = service; this.repo = repo;
  }

  private User current(){
    Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (p instanceof User u) return u;
    throw new RuntimeException("Unauthorized");
  }

  @GetMapping("/courses/{courseId}/materials")
  public ResponseEntity<?> list(@PathVariable Long courseId){
    List<Material> materials = service.listForCourse(courseId);
    List<MaterialDto> dtos = materials.stream().map(m -> {
      UserDto userDto = toUserDto(m.getUser());
      return new MaterialDto(
        m.getId(),                    // id
        m.getTitle(),                 // title
        "",                          // description
        "/api/files/" + m.getPath(), // fileUrl - adding proper API prefix
        m.getPath().substring(m.getPath().lastIndexOf('/') + 1), // fileName
        m.getType().toString(),      // fileType
        m.getSize(),                 // fileSize
        null,                        // contentType
        null,                        // course
        userDto,                     // uploader
        m.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime(), // uploadedAt
        0                            // downloadCount
      );
    }).collect(Collectors.toList());
    return ResponseEntity.ok(dtos);
  }

  @PostMapping(value="/courses/{courseId}/materials", consumes={"multipart/form-data"})
  public ResponseEntity<?> upload(@PathVariable Long courseId,
                                  @RequestParam(required=false) String title,
                                  @RequestParam(defaultValue="OTHER") MaterialType type,
                                  @RequestParam("file") MultipartFile file) throws Exception {
    if (file==null || file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","file required"));
    User currentUser = current();
    Material m = service.upload(courseId, currentUser, title, type, file);
    UserDto userDto = toUserDto(m.getUser());
    MaterialDto dto = new MaterialDto(
      m.getId(),                    // id
      m.getTitle(),                 // title
      "",                          // description
      "/api/files/" + m.getPath(), // fileUrl - adding proper API prefix
      m.getPath().substring(m.getPath().lastIndexOf('/') + 1), // fileName
      m.getType().toString(),      // fileType
      m.getSize(),                 // fileSize
      null,                        // contentType
      null,                        // course
      userDto,                     // uploader
      m.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime(), // uploadedAt
      0                           // downloadCount
    );
    return ResponseEntity.ok(dto);
  }

  @DeleteMapping("/materials/{id}")
  public ResponseEntity<?> delete(@PathVariable Long id){
    User u = current();
    Material m = repo.findById(id).orElse(null);
    if (m == null) return ResponseEntity.notFound().build();
    boolean isOwner = m.getUser().getId().equals(u.getId());
    boolean isAdmin = u.getRole().name().equals("ADMIN");
    if (!isOwner && !isAdmin) return ResponseEntity.status(403).body(Map.of("error","forbidden"));
    repo.delete(m);
    return ResponseEntity.noContent().build();
  }

  private UserDto toUserDto(User u){
    UserDto dto = new UserDto();
    dto.setId(u.getId());
    dto.setEmail(u.getEmail());
    dto.setFirstName(u.getName());
    dto.setLastName("");
    dto.setRole(u.getRole().name());
    dto.setUploadCount(0);
    dto.setCreatedAt(null);
    return dto;
  }
}
