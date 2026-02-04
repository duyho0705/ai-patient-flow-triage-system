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

        java.util.List<Invoice> findByPatientIdAndStatusOrderByCreatedAtDesc(UUID patientId, String status);

        java.util.List<Invoice> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

        Optional<Invoice> findByConsultationId(UUID consultationId);

        long countByTenantIdAndCreatedAtBetween(UUID tenantId, java.time.Instant from, java.time.Instant to);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.branch.id = :branchId AND i.status = 'PAID' AND i.createdAt BETWEEN :from AND :to")
        java.math.BigDecimal sumTotalAmountPaidByBranchAndCreatedAtBetween(UUID branchId, java.time.Instant from,
                        java.time.Instant to);

        @org.springframework.data.jpa.repository.Query("SELECT cast(i.createdAt as date), SUM(i.totalAmount) FROM Invoice i WHERE i.branch.id = :branchId AND i.status = 'PAID' AND i.createdAt BETWEEN :from AND :to GROUP BY cast(i.createdAt as date)")
        java.util.List<Object[]> sumRevenueByDay(UUID branchId, java.time.Instant from, java.time.Instant to);

        @org.springframework.data.jpa.repository.Query("SELECT item.itemName, SUM(item.lineTotal), COUNT(item) FROM Invoice i JOIN i.items item WHERE i.branch.id = :branchId AND i.status = 'PAID' AND i.createdAt BETWEEN :from AND :to GROUP BY item.itemName ORDER BY SUM(item.lineTotal) DESC")
        java.util.List<Object[]> sumRevenueByService(UUID branchId, java.time.Instant from, java.time.Instant to);
}
