package com.arms.platform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
  private final Key key;
  public JwtService(@Value("${app.jwt.secret}") String secret) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
  }
  public String generateToken(String subject, Map<String, Object> claims, long ttlMillis) {
    long now = System.currentTimeMillis();
    return Jwts.builder()
      .setSubject(subject)
      .addClaims(claims)
      .setIssuedAt(new Date(now))
      .setExpiration(new Date(now + ttlMillis))
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }
  public Jws<Claims> parse(String token) {
    return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
  }
}
