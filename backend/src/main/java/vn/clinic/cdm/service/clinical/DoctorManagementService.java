package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.doctor.DoctorDto;
import vn.clinic.cdm.dto.doctor.CreateDoctorRequest;

import java.util.List;
import java.util.UUID;

public interface DoctorManagementService {
    List<DoctorDto> getAllDoctors();
    DoctorDto getDoctorById(UUID id);
    DoctorDto createDoctor(CreateDoctorRequest request);
    void deleteDoctor(UUID id);
}
