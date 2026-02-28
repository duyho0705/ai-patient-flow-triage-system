package vn.clinic.cdm.tenant.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.domain.TenantBranch;
import vn.clinic.cdm.tenant.repository.TenantBranchRepository;
import vn.clinic.cdm.tenant.repository.TenantRepository;

import java.util.List;
import java.util.UUID;

/**
 * Tenant and branch management. No tenant context required for admin-level
 * operations.
 */
@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final TenantBranchRepository tenantBranchRepository;

    @Transactional(readOnly = true)
    public List<Tenant> listAllActive() {
        return tenantRepository.findAll().stream()
                .filter(Tenant::getIsActive)
                .toList();
    }

    @Transactional(readOnly = true)
    public Tenant getById(UUID id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));
    }

    @Transactional(readOnly = true)
    public Tenant getByCode(String code) {
        return tenantRepository.findActiveByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", code));
    }

    @Transactional(readOnly = true)
    public List<TenantBranch> getBranchesByTenantId(UUID tenantId) {
        return tenantBranchRepository.findByTenantIdAndIsActiveTrueOrderByCode(tenantId);
    }

    @Transactional(readOnly = true)
    public TenantBranch getBranchById(UUID branchId) {
        return tenantBranchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("TenantBranch", branchId));
    }

    @Transactional(readOnly = true)
    public TenantBranch getBranchByTenantAndCode(UUID tenantId, String code) {
        return tenantBranchRepository.findByTenantIdAndCode(tenantId, code)
                .orElseThrow(() -> new ResourceNotFoundException("TenantBranch", tenantId + "/" + code));
    }

    @Transactional
    public Tenant createTenant(Tenant tenant) {
        if (tenantRepository.existsByCode(tenant.getCode())) {
            throw new IllegalArgumentException("Tenant code already exists: " + tenant.getCode());
        }
        return tenantRepository.save(tenant);
    }

    @Transactional
    public TenantBranch createBranch(TenantBranch branch) {
        Tenant tenant = getById(branch.getTenant().getId());
        if (tenantBranchRepository.existsByTenantIdAndCode(tenant.getId(), branch.getCode())) {
            throw new IllegalArgumentException("Branch code already exists for tenant: " + branch.getCode());
        }
        branch.setTenant(tenant);
        return tenantBranchRepository.save(branch);
    }

    @Transactional
    public TenantBranch updateBranch(UUID id, TenantBranch details) {
        TenantBranch branch = getBranchById(id);
        branch.setNameVi(details.getNameVi());
        branch.setAddressLine(details.getAddressLine());
        branch.setCity(details.getCity());
        branch.setDistrict(details.getDistrict());
        branch.setWard(details.getWard());
        branch.setPhone(details.getPhone());
        branch.setIsActive(details.getIsActive());
        return tenantBranchRepository.save(branch);
    }

    @Transactional
    public Tenant updateSettings(UUID tenantId, String settingsJson) {
        Tenant tenant = getById(tenantId);
        tenant.setSettingsJson(settingsJson);
        return tenantRepository.save(tenant);
    }
}

