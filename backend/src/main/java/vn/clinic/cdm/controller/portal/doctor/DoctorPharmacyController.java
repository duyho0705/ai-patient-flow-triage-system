package vn.clinic.cdm.controller.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.dto.clinical.PharmacyProductDto;
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.dto.common.PagedResponse;
import vn.clinic.cdm.service.clinical.PharmacyProductService;

@RestController
@RequestMapping("/api/doctor-portal/pharmacy")
@RequiredArgsConstructor
@Tag(name = "Doctor Pharmacy", description = "Tìm kiếm danh mục thuốc cho bác sĩ")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorPharmacyController {

    private final PharmacyProductService pharmacyService;

    @GetMapping("/products")
    @Operation(summary = "Tìm kiếm danh mục thuốc để kê đơn")
    public ResponseEntity<ApiResponse<PagedResponse<PharmacyProductDto>>> searchProducts(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<PharmacyProductDto> resultPage = pharmacyService.searchProducts(search, PageRequest.of(page, size));

        PagedResponse<PharmacyProductDto> response = PagedResponse.<PharmacyProductDto>builder()
                .content(resultPage.getContent())
                .page(resultPage.getNumber())
                .size(resultPage.getSize())
                .totalElements((int) resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .first(resultPage.isFirst())
                .last(resultPage.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
