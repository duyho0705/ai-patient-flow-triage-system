package vn.clinic.cdm.clinical.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "prescription_template_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionTemplateItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private PrescriptionTemplate template;

    @Column(name = "product_name_custom")
    private String productNameCustom;

    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @Column(name = "dosage_instruction")
    private String dosageInstruction;
}

