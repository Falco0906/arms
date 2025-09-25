package com.arms.platform.material;

import com.arms.platform.course.Course;
import com.arms.platform.user.User;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MaterialRepository extends JpaRepository<Material, Long> {
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
}
