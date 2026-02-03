package vn.clinic.patientflow.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.domain.PatientInsurance;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.repository.TenantRepository;
import vn.clinic.patientflow.patient.repository.PatientInsuranceRepository;
import vn.clinic.patientflow.patient.repository.PatientRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Patient and insurance – tenant-scoped. Uses TenantContext.
 */
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientInsuranceRepository patientInsuranceRepository;
    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public Patient getById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return patientRepository.findById(id)
                .filter(p -> p.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
    }

    @Transactional(readOnly = true)
    public Page<Patient> listByTenant(Pageable pageable) {
        return patientRepository.findByTenantIdAndIsActiveTrue(TenantContext.getTenantIdOrThrow(), pageable);
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
    public List<PatientInsurance> getInsurances(UUID patientId) {
        getById(patientId);
        return patientInsuranceRepository.findByPatientIdOrderByIsPrimaryDesc(patientId);
    }

    @Transactional
    public Patient create(Patient patient) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        patient.setTenant(tenant);
        if (patient.getCccd() != null && !patient.getCccd().isBlank()
                && patientRepository.findByTenantIdAndCccd(tenantId, patient.getCccd()).isPresent()) {
            throw new IllegalArgumentException("Patient with CCCD already exists: " + patient.getCccd());
        }
        if (patient.getExternalId() != null && !patient.getExternalId().isBlank()
                && patientRepository.findByTenantIdAndExternalId(tenantId, patient.getExternalId()).isPresent()) {
            throw new IllegalArgumentException("Patient with external_id already exists: " + patient.getExternalId());
        }
        return patientRepository.save(patient);
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
        return patientRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public Optional<Patient> getByIdentityUserId(UUID identityUserId) {
        return patientRepository.findByIdentityUserId(identityUserId);
    }
}
