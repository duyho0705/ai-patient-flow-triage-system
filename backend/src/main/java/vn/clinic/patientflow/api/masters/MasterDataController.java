package vn.clinic.patientflow.api.masters;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<List<MedicalServiceDto>>> listMedicalServices(
            @RequestParam(defaultValue = "false") boolean onlyActive) {
        var data = masterDataService.listMedicalServices(onlyActive).stream()
                .map(MedicalServiceDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Tạo dịch vụ y tế mới")
    public ResponseEntity<ApiResponse<MedicalServiceDto>> create(@RequestBody MedicalServiceDto dto) {
        MedicalService svc = MedicalService.builder()
                .code(dto.getCode())
                .nameVi(dto.getNameVi())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .unitPrice(dto.getUnitPrice())
                .isActive(true)
                .build();
        return ResponseEntity
                .ok(ApiResponse.success(MedicalServiceDto.fromEntity(masterDataService.createMedicalService(svc))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Cập nhật dịch vụ y tế")
    public ResponseEntity<ApiResponse<MedicalServiceDto>> update(@PathVariable UUID id,
            @RequestBody MedicalServiceDto dto) {
        MedicalService details = MedicalService.builder()
                .code(dto.getCode())
                .nameVi(dto.getNameVi())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .unitPrice(dto.getUnitPrice())
                .isActive(dto.isActive())
                .build();
        return ResponseEntity.ok(
                ApiResponse.success(MedicalServiceDto.fromEntity(masterDataService.updateMedicalService(id, details))));
    }
}
