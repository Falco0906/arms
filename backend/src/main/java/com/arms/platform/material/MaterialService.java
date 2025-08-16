package com.arms.platform.material;

import com.arms.platform.course.Course;
import com.arms.platform.course.CourseRepository;
import com.arms.platform.user.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class MaterialService {
  private final MaterialRepository materials;
  private final CourseRepository courses;
  private final Path root;

  public MaterialService(MaterialRepository materials, CourseRepository courses,
                         @Value("${app.upload.dir}") String uploadDir) {
    this.materials = materials; this.courses = courses;
    this.root = Path.of(uploadDir).toAbsolutePath().normalize();
    this.root.toFile().mkdirs();
  }

  @Transactional
  public Material upload(Long courseId, User user, String title, MaterialType type, MultipartFile file) throws Exception {
    Course course = courses.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));
    String ext = OptionalExt.getExt(file.getOriginalFilename());
    String filename = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
    Path courseDir = root.resolve(String.valueOf(courseId));
    Files.createDirectories(courseDir);
    Path dest = courseDir.resolve(filename);
    file.transferTo(dest.toFile());

    Material m = new Material();
    m.setCourse(course);
    m.setUser(user);
    m.setTitle(title == null || title.isBlank() ? file.getOriginalFilename() : title);
    m.setType(type == null ? MaterialType.OTHER : type);
    m.setPath("/files/" + courseId + "/" + filename);
    m.setSize(file.getSize());
    return materials.save(m);
  }

  public java.util.List<Material> listForCourse(Long courseId) {
    Course course = courses.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));
    return materials.findByCourseOrderByCreatedAtDesc(course);
  }

  // small util
  static class OptionalExt {
    static String getExt(String name){
      if (name == null) return "";
      int i = name.lastIndexOf('.');
      return (i>0 && i<name.length()-1) ? name.substring(i+1) : "";
    }
  }
}
