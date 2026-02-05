package vn.clinic.patientflow.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import vn.clinic.patientflow.identity.domain.IdentityUser;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "patient_chat_conversations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientChatConversation {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_user_id", nullable = false)
    private IdentityUser doctorUser;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private String status; // ACTIVE, CLOSED

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (status == null)
            status = "ACTIVE";
    }
}
