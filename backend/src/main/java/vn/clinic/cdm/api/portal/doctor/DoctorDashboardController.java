package vn.clinic.cdm.api.portal.doctor;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Unused wildcard imports removed
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.cdm.api.dto.clinical.DoctorDashboardDto;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.clinical.service.DoctorReportingService;

@RestController
@RequestMapping("/api/doctor-portal/dashboard")
@RequiredArgsConstructor
@Tag(name = "Doctor Dashboard", description = "Dashboard dành cho bác sĩ - Chronic Disease Management")
@Slf4j
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorDashboardController {

        private final DoctorReportingService doctorReportingService;

        @GetMapping
        @Operation(summary = "Lấy dữ liệu tổng quan cho bác sĩ (Real-time Dashboard)")
        public ResponseEntity<ApiResponse<DoctorDashboardDto>> getDashboard() {
                UUID doctorUserId = AuthPrincipal.getCurrentUserId();
                return ResponseEntity.ok(ApiResponse.success(doctorReportingService.getDoctorDashboard(doctorUserId)));
        }
}
