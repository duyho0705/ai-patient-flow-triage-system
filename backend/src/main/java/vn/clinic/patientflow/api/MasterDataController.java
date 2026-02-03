package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.MedicalServiceDto;
import vn.clinic.patientflow.masters.domain.MedicalService;
import vn.clinic.patientflow.masters.service.MasterDataService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/master-data/medical-services")
@RequiredArgsConstructor
@Tag(name = "Master Data", description = "Quản lý dữ liệu danh mục")
public class MasterDataController {

    private final MasterDataService masterDataService;

    @GetMapping
    @Operation(summary = "Danh sách dịch vụ y tế")
    public List<MedicalServiceDto> listMedicalServices(@RequestParam(defaultValue = "false") boolean onlyActive) {
        return masterDataService.listMedicalServices(onlyActive).stream()
                .map(MedicalServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Tạo dịch vụ y tế mới")
    public MedicalServiceDto create(@RequestBody MedicalServiceDto dto) {
        MedicalService svc = MedicalService.builder()
                .code(dto.getCode())
                .nameVi(dto.getNameVi())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .unitPrice(dto.getUnitPrice())
                .isActive(true)
                .build();
        return MedicalServiceDto.fromEntity(masterDataService.createMedicalService(svc));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Cập nhật dịch vụ y tế")
    public MedicalServiceDto update(@PathVariable UUID id, @RequestBody MedicalServiceDto dto) {
        MedicalService details = MedicalService.builder()
                .code(dto.getCode())
                .nameVi(dto.getNameVi())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .unitPrice(dto.getUnitPrice())
                .isActive(dto.isActive())
                .build();
        return MedicalServiceDto.fromEntity(masterDataService.updateMedicalService(id, details));
    }
}
