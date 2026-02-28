package vn.clinic.cdm.api.dto.scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotAvailabilityDto {
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;
}

