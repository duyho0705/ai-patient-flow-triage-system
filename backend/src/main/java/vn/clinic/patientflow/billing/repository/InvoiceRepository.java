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

    @org.springframework.data.jpa.repository.Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.branchId = :branchId AND i.status = 'PAID' AND i.createdAt BETWEEN :from AND :to")
    java.math.BigDecimal sumTotalAmountPaidByBranchAndCreatedAtBetween(UUID branchId, java.time.Instant from,
            java.time.Instant to);

    @org.springframework.data.jpa.repository.Query("SELECT cast(i.createdAt as date), SUM(i.totalAmount) FROM Invoice i WHERE i.branchId = :branchId AND i.status = 'PAID' AND i.createdAt BETWEEN :from AND :to GROUP BY cast(i.createdAt as date)")
    java.util.List<Object[]> sumRevenueByDay(UUID branchId, java.time.Instant from, java.time.Instant to);
}
