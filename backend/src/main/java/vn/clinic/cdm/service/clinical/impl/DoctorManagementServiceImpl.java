package vn.clinic.cdm.service.clinical.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.dto.doctor.CreateDoctorRequest;
import vn.clinic.cdm.dto.doctor.DoctorDto;
import vn.clinic.cdm.entity.clinical.Doctor;
import vn.clinic.cdm.repository.clinical.DoctorRepository;
import vn.clinic.cdm.exception.ResourceNotFoundException;
import vn.clinic.cdm.service.common.AuditLogService;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.entity.identity.IdentityRole;
import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.entity.identity.IdentityUserRole;
import vn.clinic.cdm.repository.identity.IdentityRoleRepository;
import vn.clinic.cdm.repository.identity.IdentityUserRepository;
import vn.clinic.cdm.repository.identity.IdentityUserRoleRepository;
import vn.clinic.cdm.entity.tenant.Tenant;
import vn.clinic.cdm.repository.tenant.TenantRepository;
import vn.clinic.cdm.service.clinical.DoctorManagementService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorManagementServiceImpl implements DoctorManagementService {

    private final DoctorRepository doctorRepository;
    private final IdentityUserRepository identityUserRepository;
    private final IdentityUserRoleRepository identityUserRoleRepository;
    private final IdentityRoleRepository identityRoleRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Override
    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(DoctorDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorDto getDoctorById(UUID id) {
        return doctorRepository.findById(id)
                .map(DoctorDto::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }

    @Transactional
    @Override
    public DoctorDto createDoctor(CreateDoctorRequest request) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();

        if (identityUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        // 1. Create IdentityUser
        IdentityUser user = IdentityUser.builder()
                .tenant(tenant)
                .username(request.getEmail())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullNameVi(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .build();
        user = identityUserRepository.save(user);

        // 2. Assign DOCTOR role
        IdentityRole doctorRole = identityRoleRepository.findByCode("DOCTOR")
                .orElseThrow(() -> new ResourceNotFoundException("Role DOCTOR not found"));

        IdentityUserRole userRole = IdentityUserRole.builder()
                .user(user)
                .role(doctorRole)
                .tenant(tenant)
                .build();
        identityUserRoleRepository.save(userRole);

        // 3. Create Doctor profile
        Doctor doctor = Doctor.builder()
                .tenant(tenant)
                .identityUser(user)
                .specialty(request.getSpecialty())
                .licenseNumber(request.getLicenseNumber())
                .bio(request.getBio())
                .build();
        doctor = doctorRepository.save(doctor);

        auditLogService.log("CREATE", "DOCTOR", doctor.getId().toString(), "Added new doctor: " + request.getFullName());

        return DoctorDto.fromEntity(doctor);
    }

    @Transactional
    @Override
    public void deleteDoctor(UUID id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor not found");
        }
        doctorRepository.deleteById(id);
        auditLogService.log("DELETE", "DOCTOR", id.toString(), "Deleted doctor profile");
    }
}
