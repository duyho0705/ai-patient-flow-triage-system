package vn.clinic.patientflow.scheduling.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;
import vn.clinic.patientflow.tenant.domain.TenantBranch;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "scheduling_calendar_day")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchedulingCalendarDay extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private TenantBranch branch;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "day_type", nullable = false, length = 32)
    private String dayType;

    @Column(name = "open_at")
    private LocalTime openAt;

    @Column(name = "close_at")
    private LocalTime closeAt;

    @Column(name = "notes", length = 500)
    private String notes;

    public SchedulingCalendarDay(UUID id) {
        super(id);
    }
}
