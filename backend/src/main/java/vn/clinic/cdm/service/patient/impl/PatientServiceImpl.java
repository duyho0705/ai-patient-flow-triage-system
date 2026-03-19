package vn.clinic.cdm.service.patient.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.exception.ApiException;
import vn.clinic.cdm.exception.ErrorCode;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.entity.patient.Patient;
import vn.clinic.cdm.entity.patient.PatientDeviceToken;
import vn.clinic.cdm.repository.patient.PatientDeviceTokenRepository;
import vn.clinic.cdm.repository.patient.PatientRepository;
import vn.clinic.cdm.entity.tenant.Tenant;
import vn.clinic.cdm.repository.tenant.TenantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Patient and insurance â€“ tenant-scoped. Uses TenantContext.
 */
@Service("patientService")
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements vn.clinic.cdm.service.patient.PatientService {

    private final PatientRepository patientRepository;
    private final TenantRepository tenantRepository;
    private final PatientDeviceTokenRepository deviceTokenRepository;

    @Transactional(readOnly = true)
    public Patient getById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        log.debug("Fetching patient by ID: {} for tenant: {}", id, tenantId);
        return patientRepository.findById(id)
                .filter(p -> p.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> {
                    log.warn("Patient not found: {} in tenant: {}", id, tenantId);
                    return new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy bệnh nhân");
                });
    }

    @Transactional(readOnly = true)
    public Page<Patient> listByTenant(Pageable pageable) {
        return patientRepository.findByTenantIdAndIsActiveTrue(TenantContext.getTenantIdOrThrow(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> searchPatients(String search, String riskLevel, String chronicCondition, Pageable pageable) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        // Normalize empty strings to null for JPQL conditional
        String s = (search != null && !search.isBlank()) ? search.trim() : null;
        String r = (riskLevel != null && !riskLevel.isBlank()) ? riskLevel.trim().toUpperCase() : null;
        String c = (chronicCondition != null && !chronicCondition.isBlank()) ? chronicCondition.trim() : null;
        return patientRepository.searchPatients(tenantId, s, r, c, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> searchPatientsForDoctor(UUID doctorId, String search, String riskLevel, String chronicCondition, Pageable pageable) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        String s = (search != null && !search.isBlank()) ? search.trim() : null;
        String r = (riskLevel != null && !riskLevel.isBlank()) ? riskLevel.trim().toUpperCase() : null;
        String c = (chronicCondition != null && !chronicCondition.isBlank()) ? chronicCondition.trim() : null;
        return patientRepository.searchPatientsForDoctor(tenantId, doctorId, s, r, c, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Patient> findByCccd(String cccd) {
        return patientRepository.findByTenantIdAndCccd(TenantContext.getTenantIdOrThrow(), cccd);
    }

    @Transactional(readOnly = true)
    public Optional<Patient> findByPhone(String phone) {
        return patientRepository.findByTenantIdAndPhone(TenantContext.getTenantIdOrThrow(), phone);
    }

    @Transactional(readOnly = true)
    public Optional<Patient> findByEmail(String email, UUID tenantId) {
        return patientRepository.findFirstByTenantIdAndEmail(tenantId, email);
    }

    @Transactional
    public Patient save(Patient patient) {
        return patientRepository.save(patient);
    }



    @Transactional
    public Patient create(Patient patient) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        log.info("Creating new patient in tenant: {} with CCCD: {}", tenantId, patient.getCccd());

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Tenant doesn't exist"));
        
        patient.setTenant(tenant);
        
        // Validation: Unique CCCD/ExternalID per tenant
        if (patient.getCccd() != null && !patient.getCccd().isBlank()
                && patientRepository.findByTenantIdAndCccd(tenantId, patient.getCccd()).isPresent()) {
            log.error("Patient creation failed: CCCD {} already exists", patient.getCccd());
            throw new ApiException(ErrorCode.PATIENT_ALREADY_EXISTS, HttpStatus.BAD_REQUEST, "Số CCCD đã tồn tại trên hệ thống");
        }
        
        if (patient.getExternalId() != null && !patient.getExternalId().isBlank()
                && patientRepository.findByTenantIdAndExternalId(tenantId, patient.getExternalId()).isPresent()) {
            log.error("Patient creation failed: ExternalID {} already exists", patient.getExternalId());
            throw new ApiException(ErrorCode.PATIENT_ALREADY_EXISTS, HttpStatus.BAD_REQUEST, "Mã bệnh nhân đã tồn tại trên hệ thống");
        }

        Patient saved = patientRepository.save(patient);
        log.info("Patient created successfully with ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public Patient update(UUID id, Patient updates) {
        Patient existing = getById(id);
        if (updates.getFullNameVi() != null)
            existing.setFullNameVi(updates.getFullNameVi());
        if (updates.getDateOfBirth() != null)
            existing.setDateOfBirth(updates.getDateOfBirth());
        if (updates.getGender() != null)
            existing.setGender(updates.getGender());
        if (updates.getPhone() != null)
            existing.setPhone(updates.getPhone());
        if (updates.getEmail() != null)
            existing.setEmail(updates.getEmail());
        if (updates.getAddressLine() != null)
            existing.setAddressLine(updates.getAddressLine());
        if (updates.getCity() != null)
            existing.setCity(updates.getCity());
        if (updates.getDistrict() != null)
            existing.setDistrict(updates.getDistrict());
        if (updates.getWard() != null)
            existing.setWard(updates.getWard());
        if (updates.getNationality() != null)
            existing.setNationality(updates.getNationality());
        if (updates.getEthnicity() != null)
            existing.setEthnicity(updates.getEthnicity());
        if (updates.getExternalId() != null)
            existing.setExternalId(updates.getExternalId());
        if (updates.getCccd() != null)
            existing.setCccd(updates.getCccd());
        if (updates.getIsActive() != null)
            existing.setIsActive(updates.getIsActive());
        if (updates.getAvatarUrl() != null)
            existing.setAvatarUrl(updates.getAvatarUrl());
        return patientRepository.save(existing);
    }

    public Patient getByUserId(UUID userId) {
        return patientRepository.findFirstByIdentityUser_Id(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ bệnh nhân cho người dùng này"));
    }

    public Optional<Patient> getByIdentityUserId(UUID identityUserId) {
        return patientRepository.findFirstByIdentityUser_Id(identityUserId);
    }

    @Transactional
    public void registerDeviceToken(Patient patient, String fcmToken, String deviceType) {
        // Remove old token if exists to maintain uniqueness
        deviceTokenRepository.deleteByFcmToken(fcmToken);

        PatientDeviceToken token = PatientDeviceToken.builder()
                .patient(patient)
                .fcmToken(fcmToken)
                .deviceType(deviceType)
                .lastSeenAt(Instant.now())
                .build();

        deviceTokenRepository.save(token);
    }
}

