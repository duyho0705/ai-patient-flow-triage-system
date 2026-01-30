package vn.clinic.patientflow.queue.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.queue.domain.QueueDefinition;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QueueDefinitionRepository extends JpaRepository<QueueDefinition, UUID> {

    List<QueueDefinition> findByBranchIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID branchId);

    Optional<QueueDefinition> findByBranchIdAndCode(UUID branchId, String code);
}
