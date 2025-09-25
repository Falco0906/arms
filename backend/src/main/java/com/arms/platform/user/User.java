package com.arms.platform.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  private String name;

  @Column(nullable=false, unique=true)
  @com.arms.platform.validation.KlhEmail
  private String email;

  @Column(nullable=false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable=false)
  private Role role = Role.STUDENT;

  @Column(nullable=false, updatable=false)
  private Instant createdAt = Instant.now();

  public Long getId(){return id;}
  public String getName(){return name;}
  public void setName(String name){this.name=name;}
  public String getEmail(){return email;}
  public void setEmail(String email){this.email=email;}
  public String getPasswordHash(){return passwordHash;}
  public void setPasswordHash(String passwordHash){this.passwordHash=passwordHash;}
  public Role getRole(){return role;}
  public void setRole(Role role){this.role=role;}
  public Instant getCreatedAt(){return createdAt;}
}
