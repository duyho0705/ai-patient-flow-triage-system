package vn.clinic.cdm.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.entity.clinical.PharmacyProduct;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyProductDto {
    private String id;
    private String code;
    private String name;
    private String type;
    private String unit;
    private Integer quantity;

    public static PharmacyProductDto fromEntity(PharmacyProduct entity) {
        if (entity == null) return null;
        return PharmacyProductDto.builder()
                .id(entity.getId() != null ? entity.getId().toString() : entity.getCode())
                .code(entity.getCode())
                .name(entity.getName())
                .type(entity.getType())
                .unit(entity.getUnit())
                .quantity(entity.getStockQuantity())
                .build();
    }
}
