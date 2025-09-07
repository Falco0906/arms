package com.arms.platform.user;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  boolean existsByEmail(String email);
  List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
}
