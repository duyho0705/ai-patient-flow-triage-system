package vn.clinic.cdm.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.clinic.cdm.clinical.domain.Doctor;

import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByIdentityUser_Id(UUID identityUserId);

    java.util.List<Doctor> findByTenantId(UUID tenantId);

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.assignedDoctor.id = :doctorId AND p.isActive = true")
    long countAssignedPatients(@org.springframework.data.repository.query.Param("doctorId") UUID doctorId);
}

