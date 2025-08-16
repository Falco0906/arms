package com.arms.platform.repository;

import com.arms.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u ORDER BY u.uploadCount DESC")
    List<User> findAllOrderByUploadCountDesc();
    
    @Query("SELECT u FROM User u WHERE u.role = 'FACULTY' OR u.role = 'ADMIN' ORDER BY u.uploadCount DESC")
    List<User> findFacultyOrderByUploadCountDesc();
    
    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' ORDER BY u.uploadCount DESC")
    List<User> findStudentsOrderByUploadCountDesc();
}
