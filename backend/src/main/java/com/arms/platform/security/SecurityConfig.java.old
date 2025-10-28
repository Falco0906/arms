package com.arms.platform.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {
  private final JwtAuthFilter jwtAuthFilter;
  private final String allowedOrigins;

  public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                        @Value("${app.cors.allowed-origins}") String allowedOrigins) {
    this.jwtAuthFilter = jwtAuthFilter; this.allowedOrigins = allowedOrigins;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(req -> {
          CorsConfiguration cfg = new CorsConfiguration();
          cfg.setAllowedOrigins(List.of(allowedOrigins.split(",")));
          cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
          cfg.setAllowedHeaders(List.of("*"));
          cfg.setAllowCredentials(true);
          return cfg;
        }))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**","/actuator/health","/files/**").permitAll()
            .requestMatchers("/api/courses").permitAll() // Allow public access to course listing
            .requestMatchers("/api/courses/*/materials").permitAll() // Allow public access to materials
            .requestMatchers("/api/news/**").permitAll() // Allow public access to news
            .requestMatchers("/api/rankings/**").permitAll() // Allow public access to rankings
            .requestMatchers("/api/auth/test").permitAll() // Allow test endpoint
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .sessionManagement(session -> session.sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS));
    return http.build();
  }

  @Bean public BCryptPasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }
  @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
    return c.getAuthenticationManager();
  }
}
