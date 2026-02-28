package vn.clinic.cdm.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "patient_device_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDeviceToken extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "fcm_token", nullable = false, length = 500)
    private String fcmToken;

    @Column(name = "device_type", length = 32)
    private String deviceType; // ios, android, web

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    public PatientDeviceToken(UUID id) {
        super(id);
    }
}

