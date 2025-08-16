package com.arms.platform.service;

import com.arms.platform.dto.UserDto;
import com.arms.platform.entity.User;
import com.arms.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<UserDto> getTopContributors() {
        List<User> users = userRepository.findAllOrderByUploadCountDesc();
        return users.stream()
                .limit(10)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<UserDto> getTopFacultyContributors() {
        List<User> users = userRepository.findFacultyOrderByUploadCountDesc();
        return users.stream()
                .limit(5)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<UserDto> getTopStudentContributors() {
        List<User> users = userRepository.findStudentsOrderByUploadCountDesc();
        return users.stream()
                .limit(10)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }
    
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }
    
    public void incrementUploadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUploadCount(user.getUploadCount() + 1);
        userRepository.save(user);
    }
    
    private UserDto convertToDto(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getUploadCount(),
            user.getCreatedAt()
        );
    }
}
