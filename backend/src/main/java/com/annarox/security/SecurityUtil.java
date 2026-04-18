package com.annarox.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

 import com.annarox.exception.UserAuthenticationException;

@Component
public class SecurityUtil {

    public Long getCurrentUserId() {

        Object principal = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        if (principal instanceof CustomUserDetails user) {
            return user.getId();
        }
   
        throw new UserAuthenticationException("User not authenticated");
    }
}