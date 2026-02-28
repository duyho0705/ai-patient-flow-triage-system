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
public class ClinicalChecklistDto {
    private List<String> physicalExams;
    private List<String> historyQuestions;
    private String priorityFocus;
}

