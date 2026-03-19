package vn.clinic.cdm.service.clinical.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.dto.ai.RiskPatientDto;
import vn.clinic.cdm.dto.clinical.DoctorDashboardDto;
import vn.clinic.cdm.dto.clinical.RiskAnalysisDashboardDto;
import vn.clinic.cdm.dto.report.*;
import vn.clinic.cdm.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.service.clinical.ClinicalRiskService;
import vn.clinic.cdm.service.clinical.DoctorReportingService;
import vn.clinic.cdm.repository.clinical.DoctorRepository;
import vn.clinic.cdm.exception.*;
import vn.clinic.cdm.common.constant.ManagementConstants;
import vn.clinic.cdm.common.util.DateTimeUtils;
import vn.clinic.cdm.service.common.PdfService;
import vn.clinic.cdm.repository.patient.PatientRepository;
import vn.clinic.cdm.service.patient.PatientChatService;
import vn.clinic.cdm.service.scheduling.SchedulingService;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service("doctorReportingService")
@RequiredArgsConstructor
@Slf4j
public class DoctorReportingServiceImpl implements DoctorReportingService {

    private final SchedulingService schedulingService;
    private final ClinicalRiskService riskUseCase;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PatientChatService chatService;
    private final vn.clinic.cdm.repository.clinical.HealthMetricRepository healthMetricRepository;
    private final PdfService pdfService;

    @Transactional(readOnly = true)
    public DoctorDashboardDto getDoctorDashboard(UUID doctorUserId) {
        var doctor = findDoctorOrThrow(doctorUserId);
        var todayAppointments = schedulingService.getDoctorTodayAppointments(doctorUserId);
        var monitoredPatients = patientRepository.findByAssignedDoctor_IdAndIsActiveTrue(doctor.getId());
        var riskPatients = riskUseCase.identifyRiskPatients(monitoredPatients);

        return DoctorDashboardDto.builder()
                .totalPatientsToday(monitoredPatients.size())
                .pendingConsultations(countByStatus(todayAppointments, ManagementConstants.AppointmentStatus.SCHEDULED))
                .completedConsultationsToday(countByStatus(todayAppointments, ManagementConstants.AppointmentStatus.COMPLETED))
                .upcomingAppointments(todayAppointments.stream().map(AppointmentDto::fromEntity).collect(Collectors.toList()))
                .riskPatients(riskPatients)
                .criticalVitalsAlerts(formatCriticalAlerts(riskPatients))
                .unreadMessages(chatService.getUnreadMessagesForDoctor(doctorUserId))
                .build();
    }

    @Transactional(readOnly = true)
    public RiskAnalysisDashboardDto getRiskAnalysisDashboard(UUID doctorUserId) {
        var doctor = findDoctorOrThrow(doctorUserId);
        var patients = patientRepository.findByAssignedDoctor_IdAndIsActiveTrue(doctor.getId());
        var allRisks = riskUseCase.identifyRiskPatients(patients);

        int criticalCount = countRiskByType(allRisks, ManagementConstants.RiskLevel.CRITICAL);
        int warningCount = countRiskByType(allRisks, ManagementConstants.RiskLevel.HIGH, ManagementConstants.RiskLevel.MEDIUM);

        // Real-ish trend: count metrics with abnormal/critical values per day for last 7 days
        List<Integer> trend = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = now.minusDays(i);
            java.time.Instant start = DateTimeUtils.atStartOfDay(d);
            java.time.Instant end = DateTimeUtils.atEndOfDay(d);
            
            // Count patients with at least one critical/abnormal metric recorded that day
            long count = healthMetricRepository.countPatientsWithCriticalMetrics(start, end);
            trend.add((int) count);
        }

        return RiskAnalysisDashboardDto.builder()
                .criticalPatientsCount(criticalCount)
                .newAlerts24hCount((int) (criticalCount * 0.4 + warningCount * 0.2)) // Slightly better heuristic
                .stablePatientsPercentage(calculateStablePercentage(patients.size(), allRisks.size()))
                .priorityList(sortByRiskSeverity(allRisks))
                .aiInsights(buildRiskInsights(criticalCount, warningCount))
                .riskTrend7Days(trend)
                .build();
    }

    public ByteArrayInputStream generateRiskAnalysisReport(RiskAnalysisDashboardDto data, String doctorName) {
        var report = GenericReportDto.builder()
            .title("PHÂN TÍCH RỦI RO")
            .subtitle("CDM Risk Analysis")
            .doctorName(doctorName)
            .date(DateTimeUtils.formatToday())
            .summary("Tổng quan rủi ro bệnh nhân")
            .sections(List.of(
                GenericReportDto.ReportSection.builder().title("Thống kê").content(String.format("- Nguy kịch: %d\n- Ổn định: %d%%", data.getCriticalPatientsCount(), data.getStablePatientsPercentage())).build(),
                GenericReportDto.ReportSection.builder().title("Danh sách rủi ro").content(data.getPriorityList().stream().map(p -> "- " + p.getPatientName() + ": " + p.getReason()).collect(Collectors.joining("\n"))).build()
            ))
            .build();
        return pdfService.generateGenericPdf(report);
    }

    public ByteArrayInputStream generatePatientReportPdf(UUID patientId) {
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy BN"));
        
        var report = CdmReportDto.builder()
                .patientName(patient.getFullNameVi()).patientDob(DateTimeUtils.format(patient.getDateOfBirth())).patientGender(patient.getGender())
                .doctorName(patient.getAssignedDoctor() != null ? patient.getAssignedDoctor().getIdentityUser().getFullNameVi() : "N/A")
                .reportDate(DateTimeUtils.formatToday())
                .conditions(List.of(CdmReportDto.ConditionInfo.builder().name(patient.getChronicConditions()).severity(patient.getRiskLevel()).build()))
                .aiCarePlan("Phân tích phác đồ tối ưu...")
                .build();

        return pdfService.generateCdmReportPdf(report);
    }

    // --- Helpers for Code Cleanliness ---

    private vn.clinic.cdm.entity.clinical.Doctor findDoctorOrThrow(UUID userId) {
        return doctorRepository.findByIdentityUser_Id(userId).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Doctor not found"));
    }

    private Long countByStatus(List<vn.clinic.cdm.entity.scheduling.SchedulingAppointment> list, String status) {
        return list.stream().filter(a -> status.equalsIgnoreCase(a.getStatus())).count();
    }

    private int countRiskByType(List<RiskPatientDto> risks, String... levels) {
        var levelSet = Set.of(levels);
        return (int) risks.stream().filter(r -> levelSet.contains(r.getRiskLevel())).count();
    }

    private int calculateStablePercentage(int total, int atRisk) {
        return total == 0 ? 0 : (int) Math.round((double) (total - atRisk) / total * 100);
    }

    private List<String> formatCriticalAlerts(List<RiskPatientDto> risks) {
        return risks.stream().filter(r -> ManagementConstants.RiskLevel.CRITICAL.equals(r.getRiskLevel()))
                .map(r -> "CẢNH BÁO: " + r.getPatientName() + " - " + r.getReason()).collect(Collectors.toList());
    }

    private List<RiskPatientDto> sortByRiskSeverity(List<RiskPatientDto> risks) {
        var order = Map.of(
            ManagementConstants.RiskLevel.CRITICAL, 0,
            ManagementConstants.RiskLevel.HIGH, 1,
            ManagementConstants.RiskLevel.MEDIUM, 2,
            ManagementConstants.RiskLevel.LOW, 3
        );
        return risks.stream().sorted(Comparator.comparing(r -> order.getOrDefault(r.getRiskLevel(), 4))).collect(Collectors.toList());
    }

    private List<RiskAnalysisDashboardDto.RiskInsightDto> buildRiskInsights(int critical, int warning) {
        List<RiskAnalysisDashboardDto.RiskInsightDto> list = new ArrayList<>();
        if (critical > 0) list.add(RiskAnalysisDashboardDto.RiskInsightDto.builder().type(ManagementConstants.RiskLevel.CRITICAL).title("Nguy cơ khẩn cấp").description("Có " + critical + " BN cần can thiệp ngay.").build());
        if (warning > 0) list.add(RiskAnalysisDashboardDto.RiskInsightDto.builder().type("WARNING").title("Cảnh báo sớm").description("Phát hiện " + warning + " BN có xu hướng bất ổn.").build());
        return list;
    }
}
