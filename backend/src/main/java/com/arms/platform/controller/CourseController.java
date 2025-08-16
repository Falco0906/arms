package com.arms.platform.controller;

import com.arms.platform.dto.CourseDto;
import com.arms.platform.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {
    
    @Autowired
    private CourseService courseService;
    
    @GetMapping
    public ResponseEntity<List<CourseDto>> getAllCourses() {
        List<CourseDto> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<CourseDto>> searchCourses(@RequestParam String q) {
        List<CourseDto> courses = courseService.searchCourses(q);
        return ResponseEntity.ok(courses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CourseDto> getCourseById(@PathVariable Long id) {
        CourseDto course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CourseDto>> getCoursesByUser(@PathVariable Long userId) {
        List<CourseDto> courses = courseService.getCoursesByUser(userId);
        return ResponseEntity.ok(courses);
    }
}
