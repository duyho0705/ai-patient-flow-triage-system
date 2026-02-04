package vn.clinic.patientflow.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.tenant.domain.Tenant;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "patient_notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String content;

    private String type; // QUEUE, BILLING, PHARMACY, SYSTEM

    private String relatedResourceId; // UUID of Invoice, Consultation, etc.

    @Builder.Default
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
