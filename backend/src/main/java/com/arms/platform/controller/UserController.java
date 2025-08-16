package com.arms.platform.controller;

import com.arms.platform.dto.UserDto;
import com.arms.platform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/rankings")
    public ResponseEntity<List<UserDto>> getTopContributors() {
        List<UserDto> users = userService.getTopContributors();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/rankings/faculty")
    public ResponseEntity<List<UserDto>> getTopFacultyContributors() {
        List<UserDto> users = userService.getTopFacultyContributors();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/rankings/students")
    public ResponseEntity<List<UserDto>> getTopStudentContributors() {
        List<UserDto> users = userService.getTopStudentContributors();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/profile/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        UserDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
}
