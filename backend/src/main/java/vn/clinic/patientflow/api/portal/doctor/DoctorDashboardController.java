package vn.clinic.patientflow.api.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.AppointmentDto;
import vn.clinic.patientflow.api.dto.DoctorDashboardDto;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.scheduling.service.SchedulingService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/doctor/dashboard")
@RequiredArgsConstructor
@Tag(name = "Doctor Dashboard", description = "Dashboard dành cho bác sĩ - Chronic Disease Management")
@Slf4j
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorDashboardController {

        private final SchedulingService schedulingService;

        @GetMapping
        @Operation(summary = "Lấy dữ liệu tổng quan cho bác sĩ (Real-time Dashboard)")
        public ResponseEntity<ApiResponse<DoctorDashboardDto>> getDashboard() {
                UUID doctorUserId = AuthPrincipal.getCurrentUserId();
                log.debug("Building doctor dashboard for user: {}", doctorUserId);

                var todayAppointments = schedulingService.getDoctorTodayAppointments(doctorUserId);

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
                                .unreadMessages(List.of())
                                .build();
                return ResponseEntity.ok(ApiResponse.success(data));
        }
}
