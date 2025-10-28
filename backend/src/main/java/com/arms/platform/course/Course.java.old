package com.arms.platform.course;

import jakarta.persistence.*;

@Entity
@Table(name="courses", indexes=@Index(columnList="code", unique=true))
public class Course {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @Column(nullable=false, unique=true)
  private String code;

  @Column(nullable=false)
  private String title;

  @Column(columnDefinition="text")
  private String description;

  public Long getId(){return id;}
  public String getCode(){return code;}
  public void setCode(String code){this.code=code;}
  public String getTitle(){return title;}
  public void setTitle(String title){this.title=title;}
  public String getDescription(){return description;}
  public void setDescription(String description){this.description=description;}
}
