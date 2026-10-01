package org.example.ccc_fs_a.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.ccc_fs_a.common.ApiPaths;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Authentication", description = "The logged in user")
@RestController
@RequestMapping(ApiPaths.BASE + "/auth")
public class AuthController {

    @Operation(summary = "Current user",
            description = "Returns the user the credentials belong to and their roles, used by the frontend to log in")
    @GetMapping("/me")
    public CurrentUserResponse me(Authentication authentication) {
        return CurrentUserResponse.from(authentication);
    }
}
