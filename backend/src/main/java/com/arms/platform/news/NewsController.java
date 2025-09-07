package com.arms.platform.news;

import com.arms.platform.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {
    private final NewsRepository newsRepository;
    
    public NewsController(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }
    
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new RuntimeException("Unauthorized");
    }
    
    @GetMapping
    public ResponseEntity<?> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) NewsType type) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<News> newsPage;
        
        if (search != null && !search.trim().isEmpty()) {
            List<News> newsList = newsRepository.findActiveNewsBySearchQuery("%" + search + "%");
            return ResponseEntity.ok(Map.of("content", newsList, "totalElements", newsList.size()));
        } else if (type != null) {
            List<News> newsList = newsRepository.findActiveNewsByTypeOrderByCreatedAtDesc(type);
            return ResponseEntity.ok(Map.of("content", newsList, "totalElements", newsList.size()));
        } else {
            newsPage = newsRepository.findActiveNewsOrderByCreatedAtDesc(pageable);
            return ResponseEntity.ok(newsPage);
        }
    }
    
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentNews(@RequestParam(defaultValue = "5") int limit) {
        List<News> recentNews = newsRepository.findActiveNewsOrderByCreatedAtDesc()
                .stream()
                .limit(limit)
                .toList();
        return ResponseEntity.ok(recentNews);
    }
    
    @PostMapping
    public ResponseEntity<?> createNews(@Valid @RequestBody NewsRequest request) {
        User currentUser = getCurrentUser();
        
        // Only faculty and admin can create news
        if (!currentUser.getRole().name().equals("FACULTY") && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("error", "Only faculty and admin can create news"));
        }
        
        News news = new News();
        news.setTitle(request.title);
        news.setContent(request.content);
        news.setType(request.type);
        news.setAuthor(currentUser);
        news.setCreatedAt(LocalDateTime.now());
        news.setIsActive(true);
        
        News savedNews = newsRepository.save(news);
        return ResponseEntity.ok(Map.of(
            "id", savedNews.getId(),
            "title", savedNews.getTitle(),
            "content", savedNews.getContent(),
            "type", savedNews.getType(),
            "author", Map.of(
                "id", savedNews.getAuthor().getId(),
                "name", savedNews.getAuthor().getName()
            ),
            "createdAt", savedNews.getCreatedAt()
        ));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNews(@PathVariable Long id, @Valid @RequestBody NewsRequest request) {
        User currentUser = getCurrentUser();
        News news = newsRepository.findById(id).orElse(null);
        
        if (news == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Only author or admin can update
        if (!news.getAuthor().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to update this news"));
        }
        
        news.setTitle(request.title);
        news.setContent(request.content);
        news.setType(request.type);
        news.setUpdatedAt(LocalDateTime.now());
        
        News updatedNews = newsRepository.save(news);
        return ResponseEntity.ok(Map.of(
            "id", updatedNews.getId(),
            "title", updatedNews.getTitle(),
            "content", updatedNews.getContent(),
            "type", updatedNews.getType(),
            "author", Map.of(
                "id", updatedNews.getAuthor().getId(),
                "name", updatedNews.getAuthor().getName()
            ),
            "createdAt", updatedNews.getCreatedAt(),
            "updatedAt", updatedNews.getUpdatedAt()
        ));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNews(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        News news = newsRepository.findById(id).orElse(null);
        
        if (news == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Only author or admin can delete
        if (!news.getAuthor().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to delete this news"));
        }
        
        news.setIsActive(false);
        newsRepository.save(news);
        return ResponseEntity.ok(Map.of("message", "News deleted successfully"));
    }
    
    // DTO for request
    public static class NewsRequest {
        public String title;
        public String content;
        public NewsType type;
    }
}
