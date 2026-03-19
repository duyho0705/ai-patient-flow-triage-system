package vn.clinic.cdm.service.auth.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.common.constant.ManagementConstants;
import vn.clinic.cdm.exception.ResourceNotFoundException;
import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.service.identity.IdentityService;
import vn.clinic.cdm.entity.patient.Patient;
import vn.clinic.cdm.repository.patient.PatientRepository;
import vn.clinic.cdm.entity.tenant.Tenant;
import vn.clinic.cdm.repository.tenant.TenantRepository;

import java.time.LocalDate;
import java.util.UUID;

import vn.clinic.cdm.service.auth.RegisterService;

/**
 * Enterprise Service for registering new users and patients.
 */
@Service("registerService")
@RequiredArgsConstructor
@Slf4j
public class RegisterServiceImpl implements RegisterService {

    private final IdentityService identityService;
    private final PasswordEncoder passwordEncoder;
    private final TenantRepository tenantRepository;
    private final PatientRepository patientRepository;


    @Transactional
    public IdentityUser registerPatientByDoctor(String email, String fullName, String password, UUID tenantId,
            UUID branchId, LocalDate dob, String gender, String phone, String cccd, String chronicConditions) {
        log.info("Doctor is registering new patient: {}", email);

        if (identityService.existsByEmail(email)) {
            throw new vn.clinic.cdm.exception.ApiException(vn.clinic.cdm.exception.ErrorCode.RESOURCE_ALREADY_EXISTS, 
                org.springframework.http.HttpStatus.BAD_REQUEST, "Email này đã được sử dụng");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        IdentityUser user = new IdentityUser();
        user.setTenant(tenant);
        user.setEmail(email.trim().toLowerCase());
        user.setUsername(user.getEmail());
        user.setFullNameVi(fullName);
        if (password != null) {
            user.setPasswordHash(passwordEncoder.encode(password));
        } else {
            // Default password if none provided? Or maybe it's mandatory.
            user.setPasswordHash(passwordEncoder.encode("password123")); 
        }
        user.setIsActive(true);
        user = identityService.saveUser(user);

        // Assign Role
        identityService.assignRole(user.getId(), tenantId, branchId, ManagementConstants.Roles.PATIENT);

        // Create Patient Profile with more info
        Patient patient = new Patient();
        patient.setTenant(tenant);
        patient.setIdentityUser(user);
        patient.setExternalId(user.getId().toString());
        patient.setFullNameVi(user.getFullNameVi());
        patient.setEmail(user.getEmail());
        patient.setIsActive(true);
        patient.setDateOfBirth(dob != null ? dob : LocalDate.parse(ManagementConstants.Profile.DEFAULT_DOB));
        patient.setGender(gender);
        patient.setPhone(phone);
        patient.setCccd(cccd);
        patient.setChronicConditions(chronicConditions);
        
        patientRepository.save(patient);
        log.info("Patient profile created for: {}", user.getEmail());

        return user;
    }
}
