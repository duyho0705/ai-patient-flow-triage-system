package vn.clinic.patientflow.billing.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.domain.TenantBranch;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "billing_invoice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingInvoice extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private TenantBranch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "consultation_id")
    private UUID consultationId;

    @Column(name = "invoice_number", nullable = false, length = 32)
    private String invoiceNumber;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "discount_amount", nullable = false)
    private BigDecimal discountAmount;

    @Column(name = "final_amount", nullable = false)
    private BigDecimal finalAmount;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // PENDING, PAID, CANCELLED

    @Column(name = "payment_method", length = 32)
    private String paymentMethod;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BillingInvoiceItem> items = new ArrayList<>();

    public void addItem(BillingInvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }
}
