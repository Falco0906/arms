package com.arms.platform.material;

import com.arms.platform.course.Course;
import com.arms.platform.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MaterialRepository extends JpaRepository<Material, Long> {
  
  // YOUR EXISTING METHODS (keep them):
  @Query("SELECT m FROM Material m JOIN FETCH m.user WHERE m.course = ?1 ORDER BY m.createdAt DESC")
  List<Material> findByCourseOrderByCreatedAtDesc(Course course);
  
  List<Material> findByUserId(Long userId);

  @Query("""
    SELECT new com.arms.platform.material.RankingRow(m.user.id, m.user.name, COUNT(m))
    FROM Material m
    GROUP BY m.user.id, m.user.name
    ORDER BY COUNT(m) DESC
  """)
  List<RankingRow> topUploaders(Pageable pageable);
  
  // NEW METHODS for file storage API:
  
  // Find materials by course ID 
  List<Material> findByCourseIdOrderByCreatedAtDesc(Long courseId);
  
  // Search materials by filename and description
  @Query("SELECT m FROM Material m WHERE m.course.id = :courseId AND " +
         "(LOWER(m.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
         "LOWER(COALESCE(m.originalFilename, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
         "LOWER(COALESCE(m.description, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
  List<Material> searchMaterialsInCourse(@Param("courseId") Long courseId, 
                                        @Param("searchTerm") String searchTerm);
  
  // Find materials by type and course
  List<Material> findByCourseIdAndTypeOrderByCreatedAtDesc(Long courseId, MaterialType type);
  
  // Count materials by course
  long countByCourseId(Long courseId);
  
  // Get total size of materials in a course
  @Query("SELECT COALESCE(SUM(m.size), 0) FROM Material m WHERE m.course.id = :courseId")
  long getTotalSizeByCourseId(@Param("courseId") Long courseId);
  
  // Find material by ID and course ID (for access control)
  Optional<Material> findByIdAndCourseId(Long id, Long courseId);
}
