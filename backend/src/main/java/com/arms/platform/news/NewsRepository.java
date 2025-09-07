package com.arms.platform.news;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    
    @Query("SELECT n FROM News n WHERE n.isActive = true ORDER BY n.createdAt DESC")
    List<News> findActiveNewsOrderByCreatedAtDesc();
    
    @Query("SELECT n FROM News n WHERE n.isActive = true ORDER BY n.createdAt DESC")
    Page<News> findActiveNewsOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT n FROM News n WHERE n.isActive = true AND n.type = :type ORDER BY n.createdAt DESC")
    List<News> findActiveNewsByTypeOrderByCreatedAtDesc(NewsType type);
    
    @Query("SELECT n FROM News n WHERE n.isActive = true AND (n.title LIKE %:query% OR n.content LIKE %:query%) ORDER BY n.createdAt DESC")
    List<News> findActiveNewsBySearchQuery(String query);
}
