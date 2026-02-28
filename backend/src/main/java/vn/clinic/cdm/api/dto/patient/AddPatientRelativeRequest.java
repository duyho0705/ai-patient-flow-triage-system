package vn.clinic.cdm.api.dto.patient;

import lombok.Data;

@Data
public class AddPatientRelativeRequest {
    private String fullName;
    private String relationship;
    private String phoneNumber;
    private String gender;
    private Integer age;
}

