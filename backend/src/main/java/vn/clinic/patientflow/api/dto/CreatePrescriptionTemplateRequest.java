package vn.clinic.patientflow.api.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CreatePrescriptionTemplateRequest {
    private String nameVi;
    private String description;
    private List<Item> items;

    @Data
    public static class Item {
        private UUID productId;
        private Double quantity;
        private String dosageInstruction;
    }
}
