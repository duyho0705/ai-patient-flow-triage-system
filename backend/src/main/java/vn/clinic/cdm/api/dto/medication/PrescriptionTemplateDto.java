package vn.clinic.cdm.api.dto.medication;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PrescriptionTemplateDto {
    private UUID id;
    private String nameVi;
    private String description;
    private List<Item> items;

    @Data
    @Builder
    public static class Item {
        private UUID productId;
        private String productName;
        private Double quantity;
        private String dosageInstruction;
    }
}

