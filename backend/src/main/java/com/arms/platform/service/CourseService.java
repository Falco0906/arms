package com.arms.platform.service;

import com.arms.platform.dto.CourseDto;
import com.arms.platform.entity.Course;
import com.arms.platform.repository.CourseRepository;
import com.arms.platform.repository.MaterialRepository;
import com.arms.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private MaterialRepository materialRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<CourseDto> getAllCourses() {
        List<Course> courses = courseRepository.findAllOrderByName();
        return courses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<CourseDto> searchCourses(String searchTerm) {
        List<Course> courses = courseRepository.searchCourses(searchTerm);
        return courses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return convertToDto(course);
    }
    
    public List<CourseDto> getCoursesByUser(Long userId) {
        // This would need a UserCourse repository to implement properly
        // For now, returning all courses
        return getAllCourses();
    }
    
    private CourseDto convertToDto(Course course) {
        CourseDto dto = new CourseDto(
            course.getId(),
            course.getCode(),
            course.getName(),
            course.getDescription(),
            course.getColor(),
            course.getCreatedAt()
        );
        
        // Set additional counts
        dto.setMaterialCount(materialRepository.countByCourseId(course.getId()));
        dto.setStudentCount(0); // Would need UserCourse repository
        dto.setNotificationCount(0); // Would need notification system
        
        return dto;
    }
}
