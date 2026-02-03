package vn.clinic.patientflow.patient.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.patient.domain.Patient;

import java.util.Optional;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Page<Patient> findByTenantIdAndIsActiveTrue(UUID tenantId, Pageable pageable);

    Optional<Patient> findByTenantIdAndCccd(UUID tenantId, String cccd);

    Optional<Patient> findByTenantIdAndExternalId(UUID tenantId, String externalId);

    Optional<Patient> findByTenantIdAndPhone(UUID tenantId, String phone);

    boolean existsByTenantIdAndCccd(UUID tenantId, String cccd);

    boolean existsByTenantIdAndExternalId(UUID tenantId, String externalId);

    Optional<Patient> findByIdentityUserId(UUID identityUserId);
}
