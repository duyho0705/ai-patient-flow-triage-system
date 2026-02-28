package vn.clinic.cdm.api.dto.patient;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AddPatientInsuranceRequest {
    private String insuranceType;
    private String insuranceNumber;
    private String holderName;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Boolean isPrimary;
}

