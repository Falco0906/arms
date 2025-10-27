package com.arms.platform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ConfigurationValidator {
    
    private final Environment environment;
    
    public ConfigurationValidator(Environment environment) {
        this.environment = environment;
    }
    
    @EventListener(ApplicationReadyEvent.class)
    public void validateConfiguration() {
        String[] activeProfiles = environment.getActiveProfiles();
        boolean isProduction = activeProfiles.length > 0 && 
            java.util.Arrays.asList(activeProfiles).contains("prod");
        
        if (isProduction) {
            validateProductionConfiguration();
        } else {
            validateDevelopmentConfiguration();
        }
    }
    
    private void validateProductionConfiguration() {
        String jwtSecret = environment.getProperty("app.jwt.secret");
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException(
                "JWT_SECRET environment variable is required in production. " +
                "Set it to a secure random string."
            );
        }
        
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException(
                "JWT_SECRET must be at least 32 characters long for security."
            );
        }
        
        String uploadDir = environment.getProperty("app.upload.dir");
        if (uploadDir != null && !java.nio.file.Paths.get(uploadDir).isAbsolute()) {
            throw new IllegalStateException(
                "UPLOAD_DIR must be an absolute path in production."
            );
        }
        
        System.out.println("✓ Production configuration validated successfully");
    }
    
    private void validateDevelopmentConfiguration() {
        String jwtSecret = environment.getProperty("app.jwt.secret");
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            System.out.println("⚠ WARNING: JWT_SECRET not set. Using default (unsafe for production)");
        }
        
        System.out.println("✓ Development configuration validated");
    }
}
