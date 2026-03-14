package vn.clinic.cdm.api.dto.management;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationDataDto {
    private List<UnassignedPatientDto> waitingPatients;
    private List<DoctorWorkloadDto> doctorsWorkload;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnassignedPatientDto {
        private UUID id;
        private String name;
        private String symptoms;
        private String riskLevel;
        private String chronicConditions;
        private String initials;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorWorkloadDto {
        private UUID id;
        private String name;
        private String specialty;
        private String avatar;
        private long currentPatients;
        private int workloadPercentage;
        private String status; // Normal, Busy, Overloaded
    }
}
