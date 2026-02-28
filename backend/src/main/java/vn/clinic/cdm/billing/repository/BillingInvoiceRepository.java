package vn.clinic.cdm.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.billing.domain.BillingInvoice;

import java.util.List;
import java.util.UUID;

@Repository
public interface BillingInvoiceRepository extends JpaRepository<BillingInvoice, UUID> {
    List<BillingInvoice> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    List<BillingInvoice> findByPatientIdAndStatusOrderByCreatedAtDesc(UUID patientId, String status);
}

