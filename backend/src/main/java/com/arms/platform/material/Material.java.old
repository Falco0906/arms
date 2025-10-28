package com.arms.platform.material;

import com.arms.platform.course.Course;
import com.arms.platform.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="materials", indexes = {
  @Index(columnList="createdAt"),
  @Index(columnList="course_id")
})
public class Material {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional=false, fetch=FetchType.LAZY)
  @JsonIgnore
  private Course course;

  @ManyToOne(optional=false, fetch=FetchType.LAZY)
  @JsonIgnore
  private User user;

  @Column(nullable=false)
  private String title;

  @Enumerated(EnumType.STRING)
  @Column(nullable=false)
  private MaterialType type = MaterialType.OTHER;

  @Column(nullable=false)
  private String path; // relative path under upload dir

  private Long size;

  @Column(nullable=false, updatable=false)
  private Instant createdAt = Instant.now();

  public Long getId(){return id;}
  public Course getCourse(){return course;}
  public void setCourse(Course c){this.course=c;}
  public User getUser(){return user;}
  public void setUser(User u){this.user=u;}
  public String getTitle(){return title;}
  public void setTitle(String t){this.title=t;}
  public MaterialType getType(){return type;}
  public void setType(MaterialType t){this.type=t;}
  public String getPath(){return path;}
  public void setPath(String p){this.path=p;}
  public Long getSize(){return size;}
  public void setSize(Long s){this.size=s;}
  public Instant getCreatedAt(){return createdAt;}
}
