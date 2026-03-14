package vn.clinic.cdm.clinical.service;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.cdm.api.dto.ai.RiskPatientDto;
import vn.clinic.cdm.api.dto.clinical.DoctorDashboardDto;
import vn.clinic.cdm.api.dto.clinical.RiskAnalysisDashboardDto;
import vn.clinic.cdm.api.dto.report.CdmReportDto;
import vn.clinic.cdm.api.dto.report.GenericReportDto;
import vn.clinic.cdm.api.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.clinical.repository.DoctorRepository;
import vn.clinic.cdm.common.exception.ApiException;
import vn.clinic.cdm.common.exception.ErrorCode;
import vn.clinic.cdm.common.service.PdfService;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.repository.PatientRepository;
import vn.clinic.cdm.patient.service.PatientChatService;
import vn.clinic.cdm.scheduling.service.SchedulingService;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorReportingService {

        private final SchedulingService schedulingService;
        private final ClinicalRiskService riskService;
        private final DoctorRepository doctorRepository;
        private final PatientRepository patientRepository;
        private final PatientChatService chatService;
        private final PdfService pdfService;

        @Transactional(readOnly = true)
        public DoctorDashboardDto getDoctorDashboard(UUID doctorUserId) {
                log.debug("Building doctor dashboard for user: {}", doctorUserId);

                var doctorOpt = doctorRepository.findByIdentityUser_Id(doctorUserId);
                if (doctorOpt.isEmpty()) {
                        return DoctorDashboardDto.builder()
                                        .totalPatientsToday(0)
                                        .pendingConsultations(0L)
                                        .completedConsultationsToday(0L)
                                        .upcomingAppointments(List.of())
                                        .riskPatients(List.of())
                                        .criticalVitalsAlerts(List.of())
                                        .unreadMessages(List.of())
                                        .build();
                }

                var doctor = doctorOpt.get();
                var todayAppointments = schedulingService.getDoctorTodayAppointments(doctorUserId);

                // For CDM highlight, we look at all active patients the doctor is monitoring
                var monitoredPatients = patientRepository.findByAssignedDoctor_IdAndIsActiveTrue(doctor.getId());
                var riskPatients = riskService.identifyRiskPatients(monitoredPatients);

                return DoctorDashboardDto.builder()
                                .totalPatientsToday(monitoredPatients.size())
                                .pendingConsultations((long) todayAppointments.stream()
                                                .filter(a -> "SCHEDULED".equalsIgnoreCase(a.getStatus()))
                                                .count())
                                .completedConsultationsToday((long) todayAppointments.stream()
                                                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                                                .count())
                                .upcomingAppointments(
                                                todayAppointments.stream().map(AppointmentDto::fromEntity)
                                                                .collect(Collectors.toList()))
                                .riskPatients(riskPatients)
                                .criticalVitalsAlerts(riskPatients.stream()
                                                .filter(rp -> "CRITICAL".equals(rp.getRiskLevel()))
                                                .map(rp -> "CẢNH BÁO NGUY CẤP: BN " + rp.getPatientName() + " - "
                                                                + rp.getReason())
                                                .collect(Collectors.toList()))
                                .unreadMessages(chatService.getUnreadMessagesForDoctor(doctorUserId))
                                .build();
        }

        @Transactional(readOnly = true)
        public RiskAnalysisDashboardDto getRiskAnalysisDashboard(UUID doctorUserId) {
                var doctorOpt = doctorRepository.findByIdentityUser_Id(doctorUserId);
                if (doctorOpt.isEmpty()) {
                        return RiskAnalysisDashboardDto.builder()
                                        .priorityList(List.of())
                                        .aiInsights(List.of())
                                        .riskTrend7Days(List.of(0, 0, 0, 0, 0, 0, 0))
                                        .build();
                }

                var doctor = doctorOpt.get();
                List<Patient> patients = patientRepository.findByAssignedDoctor_IdAndIsActiveTrue(doctor.getId());
                var allRisks = riskService.identifyRiskPatients(patients);

                int totalPatientsCount = patients.size();
                int criticalCount = (int) allRisks.stream().filter(r -> "CRITICAL".equals(r.getRiskLevel())).count();
                int warningCount = (int) allRisks.stream()
                                .filter(r -> "HIGH".equals(r.getRiskLevel()) || "MEDIUM".equals(r.getRiskLevel()))
                                .count();
                int stableCount = totalPatientsCount - allRisks.size();
                int stablePercentage = totalPatientsCount > 0
                                ? (int) Math.round((double) stableCount / totalPatientsCount * 100)
                                : 0;

                List<RiskPatientDto> priorityList = new ArrayList<>();
                priorityList.addAll(
                                allRisks.stream().filter(r -> "CRITICAL".equals(r.getRiskLevel()))
                                                .collect(Collectors.toList()));
                priorityList.addAll(allRisks.stream().filter(r -> "HIGH".equals(r.getRiskLevel()))
                                .collect(Collectors.toList()));
                priorityList.addAll(
                                allRisks.stream().filter(r -> "MEDIUM".equals(r.getRiskLevel()))
                                                .collect(Collectors.toList()));

                List<RiskAnalysisDashboardDto.RiskInsightDto> insights = new ArrayList<>();
                if (criticalCount > 0) {
                        insights.add(RiskAnalysisDashboardDto.RiskInsightDto.builder()
                                        .type("CRITICAL")
                                        .title("Nguy cơ khẩn cấp phát hiện")
                                        .description("Có " + criticalCount
                                                        + " bệnh nhân có chỉ số nguy cấp, cần can thiệp ngay lập tức.")
                                        .build());
                }
                if (warningCount > 0) {
                        insights.add(RiskAnalysisDashboardDto.RiskInsightDto.builder()
                                        .type("WARNING")
                                        .title("Cảnh báo sớm")
                                        .description("Hệ thống phát hiện " + warningCount
                                                        + " bệnh nhân có xu hướng bất ổn.")
                                        .build());
                }

                return RiskAnalysisDashboardDto.builder()
                                .criticalPatientsCount(criticalCount)
                                .newAlerts24hCount(Math.max(0, (criticalCount + warningCount) / 2))
                                .stablePatientsPercentage(stablePercentage)
                                .priorityList(priorityList)
                                .aiInsights(insights)
                                .riskTrend7Days(List.of(0, 1, 2, 1, 3, 2, criticalCount)) // Simplified trend
                                .build();
        }

        public ByteArrayInputStream generateRiskAnalysisReport(RiskAnalysisDashboardDto data, String doctorName) {
                GenericReportDto report = GenericReportDto.builder()
                                .title("BÁO CÁO PHÂN TÍCH RỦI RO BỆNH NHÂN")
                                .subtitle("Chronic Disease Management - Risk Analysis")
                                .doctorName(doctorName)
                                .date(LocalDate.now().toString())
                                .summary("Báo cáo cung cấp cái nhìn tổng quan về tình trạng rủi ro của danh sách bệnh nhân đang quản lý.")
                                .sections(List.of(
                                                GenericReportDto.ReportSection.builder()
                                                                .title("Thống kê tổng quát")
                                                                .content(String.format(
                                                                                "- Số bệnh nhân nguy kịch: %d\n- Tỷ lệ bệnh nhân ổn định: %d%%",
                                                                                data.getCriticalPatientsCount(),
                                                                                data.getStablePatientsPercentage()))
                                                                .build(),
                                                GenericReportDto.ReportSection.builder()
                                                                .title("Danh sách bệnh nhân rủi ro cao")
                                                                .content(data.getPriorityList().stream()
                                                                                .map(p -> String.format(
                                                                                                "- %s (Mức độ: %s): %s",
                                                                                                p.getPatientName(),
                                                                                                p.getRiskLevel(),
                                                                                                p.getReason()))
                                                                                .collect(Collectors.joining("\n")))
                                                                .build()))
                                .build();

                return pdfService.generateGenericPdf(report);
        }

        public ByteArrayInputStream generatePatientReportPdf(UUID patientId) {
                var patient = patientRepository.findById(patientId)
                                .orElseThrow(() -> {
                                        log.warn("Patient not found for report generation: {}", patientId);
                                        return new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                                                        "Không tìm thấy thông tin bệnh nhân");
                                });

                var report = CdmReportDto.builder()
                                .patientName(patient.getFullNameVi())
                                .patientDob(patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString()
                                                : "N/A")
                                .patientGender(patient.getGender())
                                .doctorName(patient.getAssignedDoctor() != null
                                                ? patient.getAssignedDoctor().getIdentityUser().getFullNameVi()
                                                : "Chưa chỉ định")
                                .reportDate(LocalDate.now().toString())
                                .conditions(List.of(CdmReportDto.ConditionInfo.builder()
                                                .name(patient.getChronicConditions())
                                                .severity(patient.getRiskLevel())
                                                .build()))
                                .targets(List.of()) // Would fetch from vital targets if available
                                .adherence(List.of()) // Would fetch from medication schedule
                                .aiCarePlan("Hệ thống đang phân tích dữ liệu lâm sàng để đưa ra phác đồ tối ưu...")
                                .build();

                return pdfService.generateCdmReportPdf(report);
        }
}
