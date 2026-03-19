package vn.clinic.cdm.mapper;

import org.springframework.stereotype.Component;
import vn.clinic.cdm.dto.patient.PatientDto;
import vn.clinic.cdm.dto.patient.UpdatePatientRequest;
import vn.clinic.cdm.entity.patient.Patient;

/**
 * Enterprise Patient Mapper.
 * Centralizes Entity <-> DTO conversions for Patient-related entities.
 */
@Component
public class PatientMapper {

    /**
     * Converts Patient Entity to PatientDto.
     */
    public PatientDto toDto(Patient e) {
        if (e == null) return null;
        return PatientDto.fromEntity(e);
    }

    /**
     * Updates an existing Patient Entity from an UpdatePatientRequest.
     * Only non-null values from the request are applied.
     */
    public void updateEntity(Patient existing, UpdatePatientRequest updates) {
        if (existing == null || updates == null) return;

        if (updates.getFullNameVi() != null) existing.setFullNameVi(updates.getFullNameVi());
        if (updates.getDateOfBirth() != null) existing.setDateOfBirth(updates.getDateOfBirth());
        if (updates.getGender() != null) existing.setGender(updates.getGender());
        if (updates.getPhone() != null) existing.setPhone(updates.getPhone());
        if (updates.getEmail() != null) existing.setEmail(updates.getEmail());
        if (updates.getAddressLine() != null) existing.setAddressLine(updates.getAddressLine());
        if (updates.getCity() != null) existing.setCity(updates.getCity());
        if (updates.getDistrict() != null) existing.setDistrict(updates.getDistrict());
        if (updates.getWard() != null) existing.setWard(updates.getWard());
        if (updates.getNationality() != null) existing.setNationality(updates.getNationality());
        if (updates.getEthnicity() != null) existing.setEthnicity(updates.getEthnicity());
        if (updates.getExternalId() != null) existing.setExternalId(updates.getExternalId());
        if (updates.getCccd() != null) existing.setCccd(updates.getCccd());
        if (updates.getIsActive() != null) existing.setIsActive(updates.getIsActive());
    }
}
