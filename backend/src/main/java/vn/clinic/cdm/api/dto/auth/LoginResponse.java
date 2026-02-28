package vn.clinic.cdm.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response sau khi login thÃ nh cÃ´ng â€“ JWT vÃ  thÃ´ng tin user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private Instant expiresAt;
    private AuthUserDto user;
}

