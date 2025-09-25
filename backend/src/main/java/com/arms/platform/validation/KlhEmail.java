package com.arms.platform.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = KlhEmailValidator.class)
@Documented
public @interface KlhEmail {
    String message() default "Only @klh.edu.in email addresses are allowed";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}