package vn.clinic.patientflow.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "patient_chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientChatMessage {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private PatientChatConversation conversation;

    @Column(nullable = false)
    private String senderType; // PATIENT, DOCTOR

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Instant sentAt;

    @PrePersist
    protected void onCreate() {
        sentAt = Instant.now();
    }
}
