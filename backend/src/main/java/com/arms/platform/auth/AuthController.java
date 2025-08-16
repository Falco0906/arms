package com.arms.platform.auth;

import com.arms.platform.security.JwtService;
import com.arms.platform.user.Role;
import com.arms.platform.user.User;
import com.arms.platform.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users;
  private final BCryptPasswordEncoder encoder;
  private final JwtService jwt;

  public AuthController(UserRepository users, BCryptPasswordEncoder encoder, JwtService jwt){
    this.users = users; this.encoder = encoder; this.jwt = jwt;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody AuthDTOs.RegisterRequest req){
    if (users.existsByEmail(req.email)) return ResponseEntity.badRequest().body(Map.of("error","Email already in use"));
    User u = new User();
    u.setName(req.name);
    u.setEmail(req.email);
    u.setPasswordHash(encoder.encode(req.password));
    u.setRole(Role.STUDENT);
    users.save(u);
    String token = jwt.generateToken(u.getEmail(), Map.of("uid", u.getId(), "role", u.getRole().name()), 1000L*60*60*24*7);
    return ResponseEntity.ok(new AuthDTOs.LoginResponse(token, Map.of("id",u.getId(),"name",u.getName(),"email",u.getEmail(),"role",u.getRole())));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody AuthDTOs.LoginRequest req){
    User u = users.findByEmail(req.email).orElse(null);
    if (u == null) return ResponseEntity.status(401).body(Map.of("error","Invalid credentials"));
    if (!encoder.matches(req.password, u.getPasswordHash()))
      return ResponseEntity.status(401).body(Map.of("error","Invalid credentials"));
    String token = jwt.generateToken(u.getEmail(), Map.of("uid", u.getId(), "role", u.getRole().name()), 1000L*60*60*24*7);
    return ResponseEntity.ok(new AuthDTOs.LoginResponse(token, Map.of("id",u.getId(),"name",u.getName(),"email",u.getEmail(),"role",u.getRole())));
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(@RequestAttribute(name="user", required=false) User attrUser){
    // Fallback to SecurityContext (since we didn't add a RequestAttribute resolver)
    Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (!(principal instanceof User u)) return ResponseEntity.status(401).build();
    return ResponseEntity.ok(Map.of("id",u.getId(),"name",u.getName(),"email",u.getEmail(),"role",u.getRole()));
  }
}
