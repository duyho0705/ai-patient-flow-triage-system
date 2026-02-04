package vn.clinic.patientflow.billing.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.billing.domain.Invoice;
import vn.clinic.patientflow.billing.domain.InvoiceItem;
import vn.clinic.patientflow.billing.repository.InvoiceRepository;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;

@Service
@RequiredArgsConstructor
public class BillingService {

        private final InvoiceRepository invoiceRepository;
        private final vn.clinic.patientflow.tenant.repository.TenantRepository tenantRepository;
        private final vn.clinic.patientflow.queue.service.QueueBroadcastService queueBroadcastService;
        private final vn.clinic.patientflow.clinical.repository.PrescriptionRepository prescriptionRepository;

        @Transactional
        public Invoice createInvoice(Invoice invoice) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                var tenant = tenantRepository.findById(tenantId)
                                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
                invoice.setTenant(tenant);

                // Generate invoice number if not present
                if (invoice.getInvoiceNumber() == null) {
                        String prefix = "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmm"));
                        long count = invoiceRepository.countByTenantIdAndCreatedAtBetween(
                                        tenantId,
                                        Instant.now().minusSeconds(60),
                                        Instant.now().plusSeconds(60));
                        invoice.setInvoiceNumber(prefix + "-" + (count + 1));
                }

                // Ensure totals match items
                BigDecimal total = invoice.getItems().stream()
                                .map(InvoiceItem::getLineTotal)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                invoice.setTotalAmount(total);
                invoice.setFinalAmount(
                                total.subtract(invoice.getDiscountAmount() != null ? invoice.getDiscountAmount()
                                                : BigDecimal.ZERO));

                invoice.getItems().forEach(item -> item.setInvoice(invoice));
                return invoiceRepository.save(invoice);
        }

        @Transactional
        public Invoice markAsPaid(UUID invoiceId, String paymentMethod) {
                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));

                invoice.setStatus("PAID");
                invoice.setPaymentMethod(paymentMethod);
                invoice.setPaidAt(Instant.now());
                Invoice saved = invoiceRepository.save(invoice);

                // If there is an associated prescription, notify patient to go to pharmacy
                if (saved.getConsultation() != null) {
                        prescriptionRepository.findByConsultationId(saved.getConsultation().getId()).ifPresent(p -> {
                                queueBroadcastService.notifyPharmacyReady(saved.getPatient().getId(), p.getId());
                                // Actually, "Pharmacy Ready" means meds are ready.
                                // Here it's more like "Go to Pharmacy to get meds".
                        });
                }

                return saved;
        }

        @Transactional(readOnly = true)
        public Invoice getById(UUID id) {
                return invoiceRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
        }

        @Transactional(readOnly = true)
        public java.util.List<Invoice> getInvoices(UUID branchId, String status) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                if (status != null && !status.isEmpty()) {
                        return invoiceRepository.findByTenantIdAndBranchIdAndStatusOrderByCreatedAtDesc(tenantId,
                                        branchId, status);
                }
                return invoiceRepository.findByTenantIdAndBranchIdOrderByCreatedAtDesc(tenantId, branchId);
        }

        @Transactional(readOnly = true)
        public Optional<Invoice> getInvoiceByConsultation(UUID consultationId) {
                return invoiceRepository.findByConsultationId(consultationId);
        }

        @Transactional(readOnly = true)
        public vn.clinic.patientflow.api.dto.RevenueReportDto getRevenueReport(UUID branchId, java.time.LocalDate from,
                        java.time.LocalDate to) {
                var fromInstant = from.atStartOfDay(java.time.ZoneOffset.UTC).toInstant();
                var toInstant = to.plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant();

                var total = invoiceRepository.sumTotalAmountPaidByBranchAndCreatedAtBetween(branchId, fromInstant,
                                toInstant);
                var daily = invoiceRepository.sumRevenueByDay(branchId, fromInstant, toInstant);
                var services = invoiceRepository.sumRevenueByService(branchId, fromInstant, toInstant);

                return vn.clinic.patientflow.api.dto.RevenueReportDto.builder()
                                .branchId(branchId.toString())
                                .fromDate(from)
                                .toDate(to)
                                .totalRevenue(total != null ? total : java.math.BigDecimal.ZERO)
                                .dailyRevenue(daily.stream()
                                                .map(row -> vn.clinic.patientflow.api.dto.RevenueByDayDto.builder()
                                                                .date(((java.sql.Date) row[0]).toLocalDate())
                                                                .amount((java.math.BigDecimal) row[1])
                                                                .build())
                                                .collect(java.util.stream.Collectors.toList()))
                                .topServices(services.stream()
                                                .map(row -> vn.clinic.patientflow.api.dto.RevenueReportDto.ServiceRevenueDto
                                                                .builder()
                                                                .serviceName((String) row[0])
                                                                .amount((java.math.BigDecimal) row[1])
                                                                .count((Long) row[2])
                                                                .build())
                                                .collect(java.util.stream.Collectors.toList()))
                                .build();
        }
}
