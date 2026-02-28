package vn.clinic.cdm.scheduling.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.domain.TenantBranch;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Lá»‹ch háº¹n. status: SCHEDULED â†’ CHECKED_IN/NO_SHOW/CANCELLED/COMPLETED.
 */
@Entity
@Table(name = "scheduling_appointment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchedulingAppointment extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private TenantBranch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "slot_start_time", nullable = false)
    private LocalTime slotStartTime;

    @Column(name = "slot_end_time")
    private LocalTime slotEndTime;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "appointment_type", length = 32)
    private String appointmentType;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private IdentityUser createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_user_id")
    private IdentityUser doctorUser;

    public SchedulingAppointment(UUID id) {
        super(id);
    }
}

