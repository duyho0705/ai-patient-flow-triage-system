package vn.clinic.cdm.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    @NotBlank(message = "Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Email
    private String email;

    @NotBlank(message = "Há» tÃªn khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Size(max = 255)
    private String fullNameVi;

    @NotBlank(message = "Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Size(min = 6, max = 100)
    private String password;

    @Size(max = 20)
    private String phone;

    @NotNull(message = "Tenant ID khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private UUID tenantId;

    @NotBlank(message = "MÃ£ role khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String roleCode;

    private UUID branchId;
}

