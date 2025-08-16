package com.arms.platform.course;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
  private final CourseRepository repo;
  public CourseController(CourseRepository repo){ this.repo = repo; }

  @GetMapping
  public List<Course> list(@RequestParam(required=false) String q){
    if (q == null || q.isBlank()) return repo.findAll();
    return repo.findByTitleContainingIgnoreCaseOrCodeContainingIgnoreCase(q, q);
  }
}
