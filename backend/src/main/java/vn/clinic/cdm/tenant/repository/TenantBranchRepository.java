package vn.clinic.cdm.tenant.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.tenant.domain.TenantBranch;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantBranchRepository extends JpaRepository<TenantBranch, UUID> {

    List<TenantBranch> findByTenantIdOrderByCode(UUID tenantId);

    List<TenantBranch> findByTenantIdAndIsActiveTrueOrderByCode(UUID tenantId);

    Optional<TenantBranch> findByTenantIdAndCode(UUID tenantId, String code);

    boolean existsByTenantIdAndCode(UUID tenantId, String code);
}

