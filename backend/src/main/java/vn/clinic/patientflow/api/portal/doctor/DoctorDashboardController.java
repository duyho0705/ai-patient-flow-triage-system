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
import vn.clinic.patientflow.api.dto.QueueEntryDto;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.queue.service.QueueService;
import vn.clinic.patientflow.scheduling.service.SchedulingService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor-portal/dashboard")
@RequiredArgsConstructor
@Tag(name = "Doctor Dashboard", description = "Dashboard dành cho bác sĩ")
@Slf4j
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorDashboardController {

        private final SchedulingService schedulingService;
        private final QueueService queueService;

        @GetMapping
        @Operation(summary = "Lấy dữ liệu tổng quan cho bác sĩ (Real-time Dashboard)")
        public ResponseEntity<ApiResponse<DoctorDashboardDto>> getDashboard() {
                UUID doctorUserId = AuthPrincipal.getCurrentUserId();
                log.debug("Building doctor dashboard for user: {}", doctorUserId);

                var todayAppointments = schedulingService.getDoctorTodayAppointments(doctorUserId);
                var activeEntries = queueService.getAllActiveEntries();

                long waitingCount = activeEntries.stream()
                                .filter(q -> "WAITING".equalsIgnoreCase(q.getStatus()))
                                .count();

                long completedToday = activeEntries.stream()
                                .filter(q -> "COMPLETED".equalsIgnoreCase(q.getStatus()))
                                .count();

                var data = DoctorDashboardDto.builder()
                                .totalPatientsToday(todayAppointments.size())
                                .pendingConsultations(waitingCount)
                                .completedConsultationsToday(completedToday)
                                .activeQueue(activeEntries.stream().map(QueueEntryDto::fromEntity)
                                                .collect(Collectors.toList()))
                                .upcomingAppointments(
                                                todayAppointments.stream().map(AppointmentDto::fromEntity)
                                                                .collect(Collectors.toList()))
                                .unreadMessages(List.of())
                                .build();
                return ResponseEntity.ok(ApiResponse.success(data));
        }

        @GetMapping("/active-queue")
        @Operation(summary = "Danh sách bệnh nhân đang đợi (Prioritized by AI/Acuity)")
        public ResponseEntity<ApiResponse<List<QueueEntryDto>>> getActiveQueue() {
                var data = queueService.getAllActiveEntries().stream()
                                .map(QueueEntryDto::fromEntity)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success(data));
        }
}
