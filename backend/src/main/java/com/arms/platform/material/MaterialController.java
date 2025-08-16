package com.arms.platform.material;

import com.arms.platform.user.User;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    return ResponseEntity.ok(service.listForCourse(courseId));
  }

  @PostMapping(value="/courses/{courseId}/materials", consumes={"multipart/form-data"})
  public ResponseEntity<?> upload(@PathVariable Long courseId,
                                  @RequestParam(required=false) String title,
                                  @RequestParam(defaultValue="OTHER") MaterialType type,
                                  @RequestParam("file") MultipartFile file) throws Exception {
    if (file==null || file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","file required"));
    Material m = service.upload(courseId, current(), title, type, file);
    return ResponseEntity.ok(Map.of(
      "id", m.getId(),
      "title", m.getTitle(),
      "type", m.getType(),
      "path", m.getPath(),
      "size", m.getSize()
    ));
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
}
