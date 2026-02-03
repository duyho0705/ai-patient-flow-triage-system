package vn.clinic.patientflow.api.dto;

import lombok.*;
import vn.clinic.patientflow.masters.domain.MedicalService;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalServiceDto {
    private UUID id;
    private String code;
    private String nameVi;
    private String description;
    private String category;
    private BigDecimal unitPrice;
    private boolean isActive;

    public static MedicalServiceDto fromEntity(MedicalService s) {
        return MedicalServiceDto.builder()
                .id(s.getId())
                .code(s.getCode())
                .nameVi(s.getNameVi())
                .description(s.getDescription())
                .category(s.getCategory())
                .unitPrice(s.getUnitPrice())
                .isActive(s.isActive())
                .build();
    }
}
