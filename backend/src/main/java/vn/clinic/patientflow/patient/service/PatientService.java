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
    public List<PatientInsurance> getInsurances(UUID patientId) {
        getById(patientId);
        return patientInsuranceRepository.findByPatientIdOrderByIsPrimaryDesc(patientId);
    }
}
