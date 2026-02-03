package vn.clinic.patientflow.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.billing.domain.Invoice;

import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    java.util.List<Invoice> findByTenantIdAndBranchIdOrderByCreatedAtDesc(UUID tenantId, UUID branchId);

    java.util.List<Invoice> findByTenantIdAndBranchIdAndStatusOrderByCreatedAtDesc(UUID tenantId, UUID branchId,
            String status);

    Optional<Invoice> findByConsultationId(UUID consultationId);

    long countByTenantIdAndCreatedAtBetween(UUID tenantId, java.time.Instant from, java.time.Instant to);
}
