package vn.clinic.cdm.clinical.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.scheduling.domain.SchedulingAppointment;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.domain.TenantBranch;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "clinical_consultation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicalConsultation extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private TenantBranch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private SchedulingAppointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_user_id")
    private IdentityUser doctorUser;

    @Column(name = "room_or_station", length = 64)
    private String roomOrStation;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "chief_complaint_summary", columnDefinition = "text")
    private String chiefComplaintSummary;

    @Column(name = "diagnosis_notes", columnDefinition = "text")
    private String diagnosisNotes;

    @Column(name = "prescription_notes", columnDefinition = "text")
    private String prescriptionNotes;

    @Column(name = "ai_insights", columnDefinition = "text")
    private String aiInsights;

    public ClinicalConsultation(UUID id) {
        super(id);
    }
}

