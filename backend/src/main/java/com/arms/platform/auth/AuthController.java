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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import jakarta.servlet.http.HttpServletRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users;
  private final BCryptPasswordEncoder encoder;
  private final JwtService jwt;
  private final HttpServletRequest request;
  private final String googleClientId;
  private final HttpClient httpClient = HttpClient.newHttpClient();
  private final ObjectMapper objectMapper = new ObjectMapper();

  // Simple in-memory throttling for login attempts (per ip+email)
  private static class Attempt {
    int count; long lastTs;
  }
  private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();
  private static final int MAX_ATTEMPTS = 5;
  private static final long LOCK_WINDOW_MS = TimeUnit.MINUTES.toMillis(15);

  public AuthController(UserRepository users, BCryptPasswordEncoder encoder, JwtService jwt, HttpServletRequest request,
                        @org.springframework.beans.factory.annotation.Value("${app.oauth.google.client.id:}") String googleClientId) {
    this.users = users; this.encoder = encoder; this.jwt = jwt; this.request = request; this.googleClientId = googleClientId;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody AuthDTOs.RegisterRequest req){
      String email = req.email.trim().toLowerCase();
      if (!email.endsWith("@klh.edu.in")) {
        return ResponseEntity.badRequest().body(Map.of("error", "Only @klh.edu.in email addresses are allowed"));
      }
      if (users.existsByEmail(email)) {
        return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
      }
      // Basic password policy
      String pwd = req.password == null ? "" : req.password;
      if (pwd.length() < 8 || pwd.chars().noneMatch(Character::isDigit)) {
        return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters and include a number"));
      }
      User u = new User();
      u.setName(req.name);
      u.setEmail(email);
      u.setPasswordHash(encoder.encode(req.password));
      u.setRole(Role.STUDENT);
      users.save(u);
    String token = jwt.generateToken(u.getEmail(), Map.of("uid", u.getId(), "role", u.getRole().name()), 1000L*60*60*24*7);
    return ResponseEntity.ok(new AuthDTOs.LoginResponse(token, Map.of("id",u.getId(),"name",u.getName(),"email",u.getEmail(),"role",u.getRole())));
  }

  @PostMapping("/google")
  public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body){
    try {
      String idToken = body.getOrDefault("idToken", "");
      if (idToken.isBlank()) return ResponseEntity.status(401).body(Map.of("error","Missing token"));
      HttpRequest reqHttp = HttpRequest.newBuilder()
          .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken))
          .GET().build();
      HttpResponse<String> resp = httpClient.send(reqHttp, HttpResponse.BodyHandlers.ofString());
      if (resp.statusCode() != 200) return ResponseEntity.status(401).body(Map.of("error","Invalid Google token", "details", resp.body()));
      JsonNode p = objectMapper.readTree(resp.body());
      String email = p.path("email").asText("").toLowerCase();
      boolean emailVerified = p.path("email_verified").asText("false").equals("true");
      String hd = p.path("hd").asText("");
      String aud = p.path("aud").asText("");
      if (!aud.equals(this.googleClientId)) return ResponseEntity.status(401).body(Map.of("error","Invalid client","expected", this.googleClientId, "got", aud));
      if (!emailVerified || hd == null || !hd.equals("klh.edu.in") || !email.endsWith("@klh.edu.in")) {
        return ResponseEntity.status(401).body(Map.of("error","Only KLH Google Workspace accounts may login"));
      }
      // Upsert user
      User u = users.findByEmail(email).orElseGet(() -> {
        User x = new User();
        x.setEmail(email);
        String name = p.path("name").asText("");
        x.setName(name.isBlank() ? email : name);
        x.setPasswordHash(encoder.encode(java.util.UUID.randomUUID().toString()));
        x.setRole(Role.STUDENT);
        return users.save(x);
      });
      String tokenStr = jwt.generateToken(u.getEmail(), Map.of("uid", u.getId(), "role", u.getRole().name()), 1000L*60*60*24*7);
      return ResponseEntity.ok(new AuthDTOs.LoginResponse(tokenStr, Map.of("id",u.getId(),"name",u.getName(),"email",u.getEmail(),"role",u.getRole())));
    } catch (Exception e){
      return ResponseEntity.status(401).body(Map.of("error","Google authentication failed","message", e.getMessage()));
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody AuthDTOs.LoginRequest req){
      String email = req.email.trim().toLowerCase();
      if (!email.endsWith("@klh.edu.in")) {
        return ResponseEntity.status(401).body(Map.of("error", "Only @klh.edu.in email addresses are allowed"));
      }
      // Throttle by ip+email
      String key = (request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr()) + ":" + email;
      Attempt a = attempts.computeIfAbsent(key, k -> new Attempt());
      long now = System.currentTimeMillis();
      if (a.count >= MAX_ATTEMPTS && now - a.lastTs < LOCK_WINDOW_MS) {
        long minutes = Math.max(1, (LOCK_WINDOW_MS - (now - a.lastTs)) / 60000);
        return ResponseEntity.status(429).body(Map.of("error", "Too many attempts. Try again in ~" + minutes + " min"));
      }
      User u = users.findByEmail(email).orElse(null);
      if (u == null) return ResponseEntity.status(401).body(Map.of("error","Invalid credentials"));
      if (!encoder.matches(req.password, u.getPasswordHash())) {
        a.count += 1; a.lastTs = now; // record failed attempt
        return ResponseEntity.status(401).body(Map.of("error","Invalid credentials"));
      }
      // success: reset attempts
      a.count = 0; a.lastTs = now;
    String token = jwt.generateToken(u.getEmail(), Map.of("uid", u.getId(), "role", u.getRole().name()), 1000L*60*60*24*7);
    return ResponseEntity.ok(new AuthDTOs.LoginResponse(token, Map.of("id",u.getId(),"name",u.getName(),"email",u.getEmail(),"role",u.getRole())));
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(){
    // Get user from SecurityContext
    Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (!(principal instanceof User u)) {
      return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
    }
    return ResponseEntity.ok(Map.of(
      "id", u.getId(),
      "name", u.getName(),
      "email", u.getEmail(),
      "role", u.getRole(),
      "authorities", org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities()
    ));
  }

  @GetMapping("/test")
  public ResponseEntity<?> testAuth(){
    Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return ResponseEntity.ok(Map.of(
      "authenticated", principal instanceof User,
      "principal", principal.toString(),
      "authorities", org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities()
    ));
  }
}
