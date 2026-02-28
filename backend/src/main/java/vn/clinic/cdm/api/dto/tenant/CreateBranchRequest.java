package vn.clinic.cdm.api.dto.tenant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBranchRequest {

    @NotNull
    private UUID tenantId;

    @NotBlank
    @Size(max = 32)
    private String code;

    @NotBlank
    @Size(max = 255)
    private String nameVi;

    @Size(max = 500)
    private String addressLine;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String district;

    @Size(max = 100)
    private String ward;

    @Size(max = 20)
    private String phone;
}

