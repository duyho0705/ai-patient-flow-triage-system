package vn.clinic.cdm.service.clinical.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.dto.management.AllocationDataDto;
import vn.clinic.cdm.dto.management.AllocatePatientRequest;
import vn.clinic.cdm.entity.clinical.Doctor;
import vn.clinic.cdm.repository.clinical.DoctorRepository;
import vn.clinic.cdm.exception.ResourceNotFoundException;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.entity.patient.Patient;
import vn.clinic.cdm.repository.patient.PatientRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import vn.clinic.cdm.common.util.VNStringUtils;
import vn.clinic.cdm.service.clinical.AllocationService;

@Service("allocationService")
@RequiredArgsConstructor
public class AllocationServiceImpl implements AllocationService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public AllocationDataDto getAllocationData() {
        UUID tenantId = TenantContext.getTenantIdOrThrow();

        List<Patient> unassigned = patientRepository.findUnassignedPatients(tenantId);
        List<Doctor> doctors = doctorRepository.findByTenantId(tenantId);

        List<AllocationDataDto.UnassignedPatientDto> waitingList = unassigned.stream()
                .map(this::toUnassignedPatientDto)
                .collect(Collectors.toList());

        List<AllocationDataDto.DoctorWorkloadDto> workloadList = doctors.stream()
                .map(this::toDoctorWorkloadDto)
                .collect(Collectors.toList());

        return AllocationDataDto.builder()
                .waitingPatients(waitingList)
                .doctorsWorkload(workloadList)
                .build();
    }

    private AllocationDataDto.UnassignedPatientDto toUnassignedPatientDto(Patient p) {
        return AllocationDataDto.UnassignedPatientDto.builder()
                .id(p.getId())
                .name(p.getFullNameVi())
                .symptoms("Đang chờ đánh giá")
                .riskLevel(p.getRiskLevel())
                .chronicConditions(p.getChronicConditions())
                .initials(VNStringUtils.getInitials(p.getFullNameVi()))
                .build();
    }

    private AllocationDataDto.DoctorWorkloadDto toDoctorWorkloadDto(Doctor d) {
        long count = doctorRepository.countAssignedPatients(d.getId());
        int percentage = (int) Math.min(100, (count * 100) / 20); // Assume 20 is max load
        String status = percentage > 90 ? "Overloaded" : (percentage > 70 ? "Busy" : "Normal");
        
        return AllocationDataDto.DoctorWorkloadDto.builder()
                .id(d.getId())
                .name(d.getIdentityUser().getFullNameVi())
                .specialty(d.getSpecialty())
                .avatar(null) // IdentityUser doesn't have avatarUrl
                .currentPatients(count)
                .workloadPercentage(percentage)
                .status(status)
                .build();
    }

    @Transactional
    public void allocate(AllocatePatientRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        patient.setAssignedDoctor(doctor);
        patientRepository.save(patient);
    }
}
