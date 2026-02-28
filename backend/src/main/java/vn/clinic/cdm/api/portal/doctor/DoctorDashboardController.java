package vn.clinic.cdm.api.portal.doctor;

// Unused wildcard imports removed
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.api.dto.clinical.DoctorDashboardDto;
import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.scheduling.service.SchedulingService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor-portal/dashboard")
@RequiredArgsConstructor
@Tag(name = "Doctor Dashboard", description = "Dashboard dÃ nh cho bÃ¡c sÄ© - Chronic Disease Management")
@Slf4j
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorDashboardController {

        private final SchedulingService schedulingService;
        private final vn.clinic.cdm.clinical.service.ClinicalRiskService riskService;

        @GetMapping
        @Operation(summary = "Láº¥y dá»¯ liá»‡u tá»•ng quan cho bÃ¡c sÄ© (Real-time Dashboard)")
        public ResponseEntity<ApiResponse<DoctorDashboardDto>> getDashboard() {
                UUID doctorUserId = AuthPrincipal.getCurrentUserId();
                log.debug("Building doctor dashboard for user: {}", doctorUserId);

                var todayAppointments = schedulingService.getDoctorTodayAppointments(doctorUserId);

                // For CDM highlight, we look at all active patients the doctor is monitoring
                // In this simplified version, we look at patients with recent appointments
                var monitoredPatients = todayAppointments.stream()
                                .map(a -> a.getPatient())
                                .distinct()
                                .collect(Collectors.toList());

                var riskPatients = riskService.identifyRiskPatients(monitoredPatients);

                var data = DoctorDashboardDto.builder()
                                .totalPatientsToday(todayAppointments.size())
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
                                                .map(rp -> "Cáº¢NH BÃO NGUY Cáº¤P: BN " + rp.getPatientName() + " - "
                                                                + rp.getReason())
                                                .collect(Collectors.toList()))
                                .unreadMessages(List.of())
                                .build();
                return ResponseEntity.ok(ApiResponse.success(data));
        }
}

