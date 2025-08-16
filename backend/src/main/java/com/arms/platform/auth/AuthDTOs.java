package com.arms.platform.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDTOs {
  public static class RegisterRequest {
    @NotBlank public String name;
    @Email @NotBlank public String email;
    @NotBlank public String password;
  }
  public static class LoginRequest {
    @Email @NotBlank public String email;
    @NotBlank public String password;
  }
  public static class LoginResponse {
    public String accessToken;
    public Object user;
    public LoginResponse(String token, Object user){ this.accessToken=token; this.user=user; }
  }
}
