package vn.clinic.cdm.api.dto.tenant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTenantRequest {

    @NotBlank
    @Size(max = 32)
    private String code;

    @NotBlank
    @Size(max = 255)
    private String nameVi;

    @Size(max = 255)
    private String nameEn;

    @Size(max = 32)
    private String taxCode;

    @Size(max = 10)
    private String locale;

    @Size(max = 50)
    private String timezone;
}

