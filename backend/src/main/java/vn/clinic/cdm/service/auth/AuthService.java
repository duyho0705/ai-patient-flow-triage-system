package vn.clinic.cdm.service.auth;

import vn.clinic.cdm.dto.auth.LoginRequest;
import vn.clinic.cdm.dto.auth.LoginResponse;
import vn.clinic.cdm.dto.auth.ChangePasswordRequest;
import vn.clinic.cdm.entity.identity.IdentityUser;

import java.util.UUID;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    String createRefreshToken(IdentityUser user);
    LoginResponse rotateRefreshToken(String requestToken);
    void changePassword(UUID userId, ChangePasswordRequest request);
    void revokeAllSessions(UUID userId);
}
