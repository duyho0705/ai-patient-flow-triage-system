package vn.clinic.cdm.api.dto.patient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.patient.domain.PatientInsurance;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientInsuranceDto {
        private UUID id;
        private String insuranceType;
        private String insuranceNumber;
        private String holderName;
        private LocalDate validFrom;
        private LocalDate validTo;
        private Boolean isPrimary;

        public static PatientInsuranceDto fromEntity(PatientInsurance entity) {
                if (entity == null)
                        return null;
                return PatientInsuranceDto.builder()
                                .id(entity.getId())
                                .insuranceType(entity.getInsuranceType())
                                .insuranceNumber(entity.getInsuranceNumber())
                                .holderName(entity.getHolderName())
                                .validFrom(entity.getValidFrom())
                                .validTo(entity.getValidTo())
                                .isPrimary(entity.getIsPrimary())
                                .build();
        }
}

