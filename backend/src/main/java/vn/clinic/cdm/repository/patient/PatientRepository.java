package vn.clinic.cdm.repository.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.clinic.cdm.entity.patient.Patient;

import java.util.Optional;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Page<Patient> findByTenantIdAndIsActiveTrue(UUID tenantId, Pageable pageable);

    /**
     * Tìm kiếm + lọc bệnh nhân server-side.
     * - search: tìm theo tên (LIKE, case-insensitive)
     * - riskLevel: lọc chính xác (HIGH, MEDIUM, LOW, CRITICAL)
     * - chronicCondition: lọc LIKE trên chuỗi chronicConditions
     * Tất cả param nullable → bỏ qua khi null.
     */
    @Query("""
        SELECT p FROM Patient p
        WHERE p.tenant.id = :tenantId
          AND p.isActive = true
          AND (:search IS NULL OR LOWER(p.fullNameVi) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
          AND (:riskLevel IS NULL OR p.riskLevel = :riskLevel)
          AND (:chronicCondition IS NULL OR LOWER(p.chronicConditions) LIKE LOWER(CONCAT('%', CAST(:chronicCondition AS string), '%')))
        """)
    Page<Patient> searchPatients(
            @Param("tenantId") UUID tenantId,
            @Param("search") String search,
            @Param("riskLevel") String riskLevel,
            @Param("chronicCondition") String chronicCondition,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Patient p
        WHERE p.tenant.id = :tenantId
          AND p.isActive = true
          AND p.assignedDoctor.id = :doctorId
          AND (:search IS NULL OR LOWER(p.fullNameVi) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
          AND (:riskLevel IS NULL OR p.riskLevel = :riskLevel)
          AND (:chronicCondition IS NULL OR LOWER(p.chronicConditions) LIKE LOWER(CONCAT('%', CAST(:chronicCondition AS string), '%')))
        """)
    Page<Patient> searchPatientsForDoctor(
            @Param("tenantId") UUID tenantId,
            @Param("doctorId") UUID doctorId,
            @Param("search") String search,
            @Param("riskLevel") String riskLevel,
            @Param("chronicCondition") String chronicCondition,
            Pageable pageable
    );

    Optional<Patient> findByTenantIdAndCccd(UUID tenantId, String cccd);

    Optional<Patient> findByTenantIdAndExternalId(UUID tenantId, String externalId);

    Optional<Patient> findByTenantIdAndPhone(UUID tenantId, String phone);

    boolean existsByTenantIdAndCccd(UUID tenantId, String cccd);

    boolean existsByTenantIdAndExternalId(UUID tenantId, String externalId);

    Optional<Patient> findFirstByTenantIdAndEmail(UUID tenantId, String email);

    Optional<Patient> findFirstByIdentityUser_Id(UUID userId);

    long countByRiskLevelIn(java.util.List<String> riskLevels);

    @Query("SELECT p.chronicConditions, COUNT(p) FROM Patient p GROUP BY p.chronicConditions")
    java.util.List<Object[]> getDiseaseDistribution();

    @Query("""
        SELECT p FROM Patient p
        WHERE p.tenant.id = :tenantId
          AND p.isActive = true
          AND NOT EXISTS (
            SELECT c FROM ClinicalConsultation c
            WHERE c.patient.id = p.id
              AND c.startedAt > :cutoffDate
          )
    """)
    java.util.List<Patient> findMissedFollowUps(@Param("tenantId") UUID tenantId, @Param("cutoffDate") java.time.Instant cutoffDate);

    @Query("SELECT p FROM Patient p WHERE p.tenant.id = :tenantId AND p.isActive = true AND p.assignedDoctor IS NULL")
    java.util.List<Patient> findUnassignedPatients(@Param("tenantId") UUID tenantId);

    java.util.List<Patient> findByAssignedDoctor_IdAndIsActiveTrue(UUID doctorId);

    long countByTenantIdAndCreatedAtBetween(UUID tenantId, java.time.Instant from, java.time.Instant to);
}

