package com.arms.platform.repository;

import com.arms.platform.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(String code, String name);
    
    @Query("SELECT c FROM Course c WHERE c.code LIKE %:searchTerm% OR c.name LIKE %:searchTerm%")
    List<Course> searchCourses(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Course c ORDER BY c.name ASC")
    List<Course> findAllOrderByName();
}
