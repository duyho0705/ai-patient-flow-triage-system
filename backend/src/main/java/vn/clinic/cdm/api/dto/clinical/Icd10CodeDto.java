package vn.clinic.cdm.api.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Icd10CodeDto {
    private String primaryCode;
    private String description;
    private double confidence;
    private List<AlternativeCode> alternativeCodes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlternativeCode {
        private String code;
        private String description;
    }
}

