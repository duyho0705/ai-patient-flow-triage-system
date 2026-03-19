package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.clinical.DoctorDashboardDto;
import vn.clinic.cdm.dto.clinical.RiskAnalysisDashboardDto;

import java.io.ByteArrayInputStream;
import java.util.UUID;

public interface DoctorReportingService {
    DoctorDashboardDto getDoctorDashboard(UUID doctorUserId);
    RiskAnalysisDashboardDto getRiskAnalysisDashboard(UUID doctorUserId);
    ByteArrayInputStream generateRiskAnalysisReport(RiskAnalysisDashboardDto data, String doctorName);
    ByteArrayInputStream generatePatientReportPdf(UUID patientId);
}
