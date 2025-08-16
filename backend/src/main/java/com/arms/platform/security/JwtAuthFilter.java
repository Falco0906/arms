package com.arms.platform.security;

import com.arms.platform.user.User;
import com.arms.platform.user.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends GenericFilter {
  private final JwtService jwt;
  private final UserRepository users;

  public JwtAuthFilter(JwtService jwt, UserRepository users) {
    this.jwt = jwt; this.users = users;
  }

  @Override
  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest http = (HttpServletRequest) req;
    String auth = http.getHeader(HttpHeaders.AUTHORIZATION);
    if (auth != null && auth.startsWith("Bearer ")) {
      String token = auth.substring(7);
      try {
        Claims claims = jwt.parse(token).getBody();
        String email = claims.getSubject();
        users.findByEmail(email).ifPresent(u -> {
          UsernamePasswordAuthenticationToken at =
            new UsernamePasswordAuthenticationToken(u, null, Collections.emptyList());
          SecurityContextHolder.getContext().setAuthentication(at);
        });
      } catch (Exception ignored) {}
    }
    chain.doFilter(req, res);
  }
}
