package vn.clinic.cdm.patient.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.identity.domain.IdentityUser;

@Entity
@Table(name = "patient_chat_conversations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientChatConversation {
    @Id
    @GeneratedValue
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

