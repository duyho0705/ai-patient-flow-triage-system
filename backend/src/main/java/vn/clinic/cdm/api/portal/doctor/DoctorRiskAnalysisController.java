package vn.clinic.cdm.api.portal.doctor;

import java.io.ByteArrayInputStream;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.cdm.api.dto.clinical.RiskAnalysisDashboardDto;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.clinical.service.DoctorReportingService;

@RestController
@RequestMapping("/api/doctor-portal/risk-analysis")
@RequiredArgsConstructor
@Tag(name = "Doctor Risk Analysis", description = "Phân tích rủi ro chuyên sâu cho bác sĩ")
@Slf4j
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorRiskAnalysisController {

    private final vn.clinic.cdm.clinical.repository.DoctorRepository doctorRepository;
    private final DoctorReportingService reportingService;

    @GetMapping
    @Operation(summary = "Lấy dữ liệu dashboard phân tích rủi ro")
    public ResponseEntity<ApiResponse<RiskAnalysisDashboardDto>> getRiskAnalysisDashboard() {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(reportingService.getRiskAnalysisDashboard(doctorUserId)));
    }

    @GetMapping("/export-pdf")
    @Operation(summary = "Xuất báo cáo rủi ro (PDF)")
    public ResponseEntity<byte[]> exportRiskReport() {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        var doctorOpt = doctorRepository.findByIdentityUser_Id(doctorUserId);

        String doctorName = doctorOpt.isPresent() && doctorOpt.get().getIdentityUser() != null
                ? doctorOpt.get().getIdentityUser().getFullNameVi()
                : "Bác sĩ phụ trách";

        RiskAnalysisDashboardDto dashboard = reportingService.getRiskAnalysisDashboard(doctorUserId);
        ByteArrayInputStream bis = reportingService.generateRiskAnalysisReport(dashboard, doctorName);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=risk_analysis_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(bis.readAllBytes());
    }
}
