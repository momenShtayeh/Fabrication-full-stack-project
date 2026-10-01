package org.example.ccc_fs_a.auth;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

public record CurrentUserResponse(String username, List<String> roles) {

    private static final String ROLE_PREFIX = "ROLE_";

    public static CurrentUserResponse from(Authentication authentication) {
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith(ROLE_PREFIX))
                .map(authority -> authority.substring(ROLE_PREFIX.length()))
                .toList();
        return new CurrentUserResponse(authentication.getName(), roles);
    }
}
