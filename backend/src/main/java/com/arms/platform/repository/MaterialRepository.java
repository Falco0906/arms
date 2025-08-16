package com.arms.platform.repository;

import com.arms.platform.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByCourseIdOrderByUploadedAtDesc(Long courseId);
    
    List<Material> findByUploaderIdOrderByUploadedAtDesc(Long uploaderId);
    
    @Query("SELECT m FROM Material m WHERE m.course.id = :courseId AND m.contentType = :contentType ORDER BY m.uploadedAt DESC")
    List<Material> findByCourseIdAndContentTypeOrderByUploadedAtDesc(@Param("courseId") Long courseId, @Param("contentType") String contentType);
    
    @Query("SELECT m FROM Material m WHERE m.title LIKE %:searchTerm% OR m.description LIKE %:searchTerm% ORDER BY m.uploadedAt DESC")
    List<Material> searchMaterials(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT m FROM Material m WHERE m.course.id = :courseId ORDER BY m.uploadedAt DESC LIMIT 5")
    List<Material> findRecentByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT m FROM Material m ORDER BY m.uploadedAt DESC LIMIT 10")
    List<Material> findRecentUploads();
    
    @Query("SELECT COUNT(m) FROM Material m WHERE m.course.id = :courseId")
    int countByCourseId(@Param("courseId") Long courseId);
}
