package vn.clinic.cdm.service.masters.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.exception.ResourceNotFoundException;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.entity.masters.MedicalService;
import vn.clinic.cdm.repository.masters.MedicalServiceRepository;
import vn.clinic.cdm.repository.tenant.TenantRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MasterDataServiceImpl implements vn.clinic.cdm.service.masters.MasterDataService {

    private final MedicalServiceRepository serviceRepository;
    private final TenantRepository tenantRepository;
    private final vn.clinic.cdm.service.common.AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<MedicalService> listMedicalServices(boolean onlyActive) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        if (onlyActive) {
            return serviceRepository.findByTenantIdAndIsActiveOrderByCategoryAscNameViAsc(tenantId, true);
        }
        return serviceRepository.findByTenantIdOrderByCategoryAscNameViAsc(tenantId);
    }

    @Transactional
    public MedicalService createMedicalService(MedicalService svc) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        var tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        svc.setTenant(tenant);
        MedicalService saved = serviceRepository.save(svc);
        auditLogService.log("CREATE", "MEDICAL_SERVICE", saved.getId().toString(), "Táº¡o dá»‹ch vá»¥: " + saved.getNameVi());
        return saved;
    }

    @Transactional
    public MedicalService updateMedicalService(UUID id, MedicalService details) {
        var svc = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalService", id));

        svc.setNameVi(details.getNameVi());
        svc.setCode(details.getCode());
        svc.setDescription(details.getDescription());
        svc.setCategory(details.getCategory());
        svc.setUnitPrice(details.getUnitPrice());
        svc.setActive(details.isActive());

        MedicalService saved = serviceRepository.save(svc);
        auditLogService.log("UPDATE", "MEDICAL_SERVICE", id.toString(), "Cáº­p nháº­t dá»‹ch vá»¥: " + saved.getNameVi());
        return saved;
    }
}

