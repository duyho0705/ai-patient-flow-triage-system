package vn.clinic.cdm.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.common.ManagementConstants;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.identity.service.IdentityService;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.repository.PatientRepository;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.repository.TenantRepository;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Enterprise Service for registering new users and patients.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RegisterService {

    private final IdentityService identityService;
    private final PasswordEncoder passwordEncoder;
    private final TenantRepository tenantRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public IdentityUser registerNewPatient(String email, String fullName, String password, UUID tenantId,
            UUID branchId) {
        log.info("Registering new patient: {}", email);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        IdentityUser user = new IdentityUser();
        user.setTenant(tenant);
        user.setEmail(email.trim().toLowerCase());
        user.setUsername(user.getEmail());
        user.setFullNameVi(fullName);
        if (password != null) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        user.setIsActive(true);
        user = identityService.saveUser(user);

        // Assign Role
        identityService.assignRole(user.getId(), tenantId, branchId, ManagementConstants.Roles.PATIENT);

        // Create Patient Profile
        createPatientProfile(user, tenant);

        return user;
    }

    @Transactional
    public void createPatientProfile(IdentityUser user, Tenant tenant) {
        if (patientRepository.findFirstByIdentityUser_Id(user.getId()).isPresent()) {
            log.info("Patient profile already exists for: {}. Skipping creation.", user.getEmail());
            return;
        }
        Patient patient = new Patient();
        patient.setTenant(tenant);
        patient.setIdentityUser(user);
        patient.setExternalId(user.getId().toString());
        patient.setFullNameVi(user.getFullNameVi());
        patient.setEmail(user.getEmail());
        patient.setIsActive(true);
        patient.setDateOfBirth(LocalDate.parse(ManagementConstants.Profile.DEFAULT_DOB));
        patientRepository.save(patient);
        log.info("Patient profile created for: {}", user.getEmail());
    }
}
