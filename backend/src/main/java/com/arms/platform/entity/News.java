package com.arms.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news")
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String content;
    private String type; // news, announcement
    
    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "is_pinned")
    private boolean isPinned = false;
    
    // Constructors
    public News() {
        this.publishedAt = LocalDateTime.now();
    }
    
    public News(String title, String content, String type, User author) {
        this();
        this.title = title;
        this.content = content;
        this.type = type;
        this.author = author;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    
    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean pinned) { isPinned = pinned; }
}
