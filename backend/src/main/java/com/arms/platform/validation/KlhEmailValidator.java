package com.arms.platform.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class KlhEmailValidator implements ConstraintValidator<KlhEmail, String> {
    @Override
    public void initialize(KlhEmail constraintAnnotation) {
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null) {
            return false;
        }
        return email.toLowerCase().endsWith("@klh.edu.in");
    }
}