package vn.clinic.patientflow.pharmacy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.pharmacy.domain.InventoryTransaction;

import java.util.List;
import java.util.UUID;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, UUID> {
    List<InventoryTransaction> findByBranchIdOrderByCreatedAtDesc(UUID branchId);
}
