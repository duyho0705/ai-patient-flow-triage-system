package vn.clinic.patientflow.masters.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.masters.domain.MedicalService;
import vn.clinic.patientflow.masters.repository.MedicalServiceRepository;
import vn.clinic.patientflow.tenant.repository.TenantRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final MedicalServiceRepository serviceRepository;
    private final TenantRepository tenantRepository;
    private final vn.clinic.patientflow.common.service.AuditLogService auditLogService;

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
        auditLogService.log("CREATE", "MEDICAL_SERVICE", saved.getId().toString(), "Tạo dịch vụ: " + saved.getNameVi());
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
        auditLogService.log("UPDATE", "MEDICAL_SERVICE", id.toString(), "Cập nhật dịch vụ: " + saved.getNameVi());
        return saved;
    }
}
