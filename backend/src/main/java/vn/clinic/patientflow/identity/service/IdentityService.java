package vn.clinic.patientflow.identity.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.domain.IdentityUserRole;
import vn.clinic.patientflow.identity.repository.IdentityUserRepository;
import vn.clinic.patientflow.identity.repository.IdentityUserRoleRepository;

import java.util.List;
import java.util.UUID;

/**
 * Identity (user, roles) – lookup and tenant-scoped role resolution.
 */
@Service
@RequiredArgsConstructor
public class IdentityService {

    private final IdentityUserRepository identityUserRepository;
    private final IdentityUserRoleRepository identityUserRoleRepository;

    @Transactional(readOnly = true)
    public IdentityUser getUserById(UUID id) {
        return identityUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IdentityUser", id));
    }

    @Transactional(readOnly = true)
    public IdentityUser getActiveUserByEmail(String email) {
        return identityUserRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("IdentityUser", email));
    }

    @Transactional(readOnly = true)
    public List<IdentityUserRole> getUserRolesForTenant(UUID userId, UUID tenantId) {
        return identityUserRoleRepository.findByUserIdAndTenantId(userId, tenantId);
    }
}
