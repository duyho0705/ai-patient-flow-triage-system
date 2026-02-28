package vn.clinic.cdm.clinical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.api.dto.medication.CreatePrescriptionTemplateRequest;
import vn.clinic.cdm.api.dto.medication.PrescriptionTemplateDto;
import vn.clinic.cdm.clinical.domain.PrescriptionTemplate;
import vn.clinic.cdm.clinical.domain.PrescriptionTemplateItem;
import vn.clinic.cdm.clinical.repository.PrescriptionTemplateRepository;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.repository.TenantRepository;
import vn.clinic.cdm.common.tenant.TenantContext;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionTemplateService {

        private final PrescriptionTemplateRepository templateRepository;
        private final TenantRepository tenantRepository;

        @Transactional
        @org.springframework.cache.annotation.CacheEvict(value = "prescription_templates", key = "T(vn.clinic.cdm.common.tenant.TenantContext).getTenantIdOrThrow()")
        public PrescriptionTemplate createTemplate(CreatePrescriptionTemplateRequest request, UUID creatorId) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();

                PrescriptionTemplate template = PrescriptionTemplate.builder()
                                .tenant(tenant)
                                .nameVi(request.getNameVi())
                                .description(request.getDescription())
                                .createdBy(creatorId)
                                .build();

                List<PrescriptionTemplateItem> items = request.getItems().stream()
                                .map(i -> PrescriptionTemplateItem.builder()
                                                .template(template)
                                                .productNameCustom(i.getProductNameCustom() != null
                                                                ? i.getProductNameCustom()
                                                                : "Unknown")
                                                .quantity(i.getQuantity())
                                                .dosageInstruction(i.getDosageInstruction())
                                                .build())
                                .collect(Collectors.toList());

                template.setItems(items);
                return templateRepository.save(template);
        }

        @Transactional(readOnly = true)
        @org.springframework.cache.annotation.Cacheable(value = "prescription_templates", key = "T(vn.clinic.cdm.common.tenant.TenantContext).getTenantIdOrThrow()")
        public List<PrescriptionTemplateDto> getTemplates() {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                return templateRepository.findByTenantId(tenantId).stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        private PrescriptionTemplateDto mapToDto(PrescriptionTemplate t) {
                return PrescriptionTemplateDto.builder()
                                .id(t.getId())
                                .nameVi(t.getNameVi())
                                .description(t.getDescription())
                                .items(t.getItems().stream().map(i -> PrescriptionTemplateDto.Item.builder()
                                                .productId(null)
                                                .productName(i.getProductNameCustom())
                                                .quantity(i.getQuantity())
                                                .dosageInstruction(i.getDosageInstruction())
                                                .build()).collect(Collectors.toList()))
                                .build();
        }
}

