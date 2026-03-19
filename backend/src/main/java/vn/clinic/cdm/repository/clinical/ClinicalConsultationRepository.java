package vn.clinic.cdm.repository.clinical;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import vn.clinic.cdm.entity.clinical.ClinicalConsultation;

import java.util.UUID;

public interface ClinicalConsultationRepository extends JpaRepository<ClinicalConsultation, UUID> {
        @EntityGraph(attributePaths = { "patient", "appointment", "doctorUser" })
        java.util.List<ClinicalConsultation> findByPatientIdOrderByStartedAtDesc(UUID patientId);

        @EntityGraph(attributePaths = { "patient", "appointment", "doctorUser" })
        java.util.List<ClinicalConsultation> findTop5ByPatientIdOrderByStartedAtDesc(UUID patientId);

        @EntityGraph(attributePaths = { "patient", "appointment", "doctorUser" })
        org.springframework.data.domain.Page<ClinicalConsultation> findByPatientIdOrderByStartedAtDesc(UUID patientId,
                        org.springframework.data.domain.Pageable pageable);

        long countByTenantIdAndStartedAtBetween(UUID tenantId, java.time.Instant from, java.time.Instant to);

        @org.springframework.data.jpa.repository.Query("SELECT c.doctorUser.id, COUNT(c) FROM ClinicalConsultation c WHERE c.tenant.id = :tenantId AND c.startedAt >= :since GROUP BY c.doctorUser.id")
        java.util.List<Object[]> getDoctorVisitCounts(@org.springframework.data.repository.query.Param("tenantId") UUID tenantId, @org.springframework.data.repository.query.Param("since") java.time.Instant since);

        long countByDoctorUserId(UUID doctorUserId);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT c.patient.id) FROM ClinicalConsultation c WHERE c.tenant.id = :tenantId")
        long countDistinctPatientByTenantId(@org.springframework.data.repository.query.Param("tenantId") UUID tenantId);

        @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(p.patient_id) FROM (SELECT patient_id FROM clinical_consultation WHERE tenant_id = :tenantId GROUP BY patient_id HAVING COUNT(*) > 1) AS p", nativeQuery = true)
        long countRepeatPatientsByTenantId(@org.springframework.data.repository.query.Param("tenantId") UUID tenantId);

        java.util.List<vn.clinic.cdm.entity.clinical.ClinicalConsultation> findByDoctorUserIdAndEndedAtIsNotNull(UUID doctorUserId);
}

