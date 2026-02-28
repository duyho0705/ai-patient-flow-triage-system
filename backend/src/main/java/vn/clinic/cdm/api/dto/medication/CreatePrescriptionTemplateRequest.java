package vn.clinic.cdm.api.dto.medication;

import lombok.Data;
import java.util.List;

@Data
public class CreatePrescriptionTemplateRequest {
    private String nameVi;
    private String description;
    private List<Item> items;

    @Data
    public static class Item {
        private String productNameCustom;
        private Double quantity;
        private String dosageInstruction;
    }
}

