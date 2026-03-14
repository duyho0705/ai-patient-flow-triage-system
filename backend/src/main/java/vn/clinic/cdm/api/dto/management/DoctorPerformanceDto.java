package vn.clinic.cdm.api.dto.management;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPerformanceDto {
    private UUID doctorId;
    private String fullName;
    private String specialty;
    private long consultationCount;
    private long prescriptionCount;
    private double avgRating;
    private String avgConsultationTime;
    private String status; // e.g., "Excellent", "Needs Improvement"
}
