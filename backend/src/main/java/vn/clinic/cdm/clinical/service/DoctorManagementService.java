package vn.clinic.cdm.clinical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.api.dto.clinical.CreateDoctorRequest;
import vn.clinic.cdm.api.dto.clinical.DoctorDto;
import vn.clinic.cdm.clinical.domain.Doctor;
import vn.clinic.cdm.clinical.repository.DoctorRepository;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;
import vn.clinic.cdm.common.service.AuditLogService;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.identity.domain.IdentityRole;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.identity.domain.IdentityUserRole;
import vn.clinic.cdm.identity.repository.IdentityRoleRepository;
import vn.clinic.cdm.identity.repository.IdentityUserRepository;
import vn.clinic.cdm.identity.repository.IdentityUserRoleRepository;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.repository.TenantRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorManagementService {

    private final DoctorRepository doctorRepository;
    private final IdentityUserRepository identityUserRepository;
    private final IdentityUserRoleRepository identityUserRoleRepository;
    private final IdentityRoleRepository identityRoleRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(DoctorDto::fromEntity)
                .collect(Collectors.toList());
    }

    public DoctorDto getDoctorById(UUID id) {
        return doctorRepository.findById(id)
                .map(DoctorDto::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }

    @Transactional
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
    public void deleteDoctor(UUID id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor not found");
        }
        doctorRepository.deleteById(id);
        auditLogService.log("DELETE", "DOCTOR", id.toString(), "Deleted doctor profile");
    }
}
