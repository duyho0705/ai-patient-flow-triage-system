package vn.clinic.cdm.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request Ä‘Äƒng nháº­p â€“ email, máº­t kháº©u, tenant (báº¯t buá»™c), branch (tÃ¹y chá»n).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Email
    private String email;

    @NotBlank(message = "Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String password;

    @NotNull(message = "Tenant ID khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private UUID tenantId;

    private UUID branchId;
}

