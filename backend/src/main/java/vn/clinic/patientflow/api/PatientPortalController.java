package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.billing.service.BillingService;
import vn.clinic.patientflow.clinical.service.ClinicalService;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.scheduling.service.SchedulingService;
import vn.clinic.patientflow.triage.service.TriageService;
import vn.clinic.patientflow.queue.service.QueueService;
import vn.clinic.patientflow.patient.service.PatientNotificationService;
import vn.clinic.patientflow.triage.ai.AiTriageService;
import vn.clinic.patientflow.triage.ai.AiTriageService.TriageSuggestionResult;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import vn.clinic.patientflow.tenant.service.TenantService;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
@Tag(name = "Patient Portal", description = "Cổng thông tin dành cho Bệnh nhân")
@PreAuthorize("hasRole('PATIENT')")
public class PatientPortalController {

    private final PatientService patientService;
    private final SchedulingService schedulingService;
    private final ClinicalService clinicalService;
    private final BillingService billingService;
    private final TriageService triageService;
    private final QueueService queueService;
    private final TenantService tenantService;
    private final PatientNotificationService patientNotificationService;
    private final vn.clinic.patientflow.patient.repository.PatientNotificationRepository patientNotificationRepository;

    @GetMapping("/profile")
    @Operation(summary = "Lấy hồ sơ bệnh nhân của user hiện tại")
    public PatientDto getProfile() {
        Patient patient = getAuthenticatedPatient();
        return PatientDto.fromEntity(patient);
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Dữ liệu tổng quan cho trang chủ bệnh nhân")
    public PatientDashboardDto getDashboard() {
        Patient p = getAuthenticatedPatient();
        var appointments = schedulingService.getUpcomingAppointmentsByPatient(p.getId());
        var recentVisits = clinicalService.getRecentConsultationsByPatient(p.getId(), 5);
        var activeQueues = queueService.getActiveEntriesByPatient(p.getId());

        return PatientDashboardDto.builder()
                .patientId(p.getId())
                .branchId(activeQueues.isEmpty() ? null : activeQueues.get(0).getBranch().getId())
                .patientName(p.getFullNameVi())
                .activeQueues((long) activeQueues.size())
                .nextAppointment(appointments.isEmpty() ? null : AppointmentDto.fromEntity(appointments.get(0)))
                .recentVisits(recentVisits.stream().map(ConsultationDto::fromEntity).collect(Collectors.toList()))
                .build();
    }

    @GetMapping("/appointments")
    @Operation(summary = "Danh sách lịch hẹn của bệnh nhân")
    public List<AppointmentDto> getAppointments() {
        Patient p = getAuthenticatedPatient();
        return schedulingService.getAppointmentsByPatient(p.getId())
                .stream().map(AppointmentDto::fromEntity).collect(Collectors.toList());
    }

    @GetMapping("/medical-history")
    @Operation(summary = "Lịch sử khám bệnh")
    public List<ConsultationDto> getHistory() {
        Patient p = getAuthenticatedPatient();
        return clinicalService.getConsultationsByPatient(p.getId())
                .stream().map(ConsultationDto::fromEntity).collect(Collectors.toList());
    }

    @GetMapping("/medical-history/{id}")
    @Operation(summary = "Chi tiết ca khám")
    public ConsultationDetailDto getHistoryDetail(@PathVariable UUID id) {
        Patient p = getAuthenticatedPatient();
        var cons = clinicalService.getById(id);
        if (!cons.getPatient().getId().equals(p.getId())) {
            throw new ResourceNotFoundException("Consultation", id);
        }

        var prescription = clinicalService.getPrescriptionByConsultation(id)
                .map(pres -> clinicalService.mapPrescriptionToDto(pres))
                .orElse(null);

        var invoice = billingService.getInvoiceByConsultation(id)
                .map(InvoiceDto::fromEntity)
                .orElse(null);

        var vitals = triageService.getVitals(cons.getQueueEntry().getTriageSession().getId())
                .stream()
                .map(v -> new TriageVitalDto(
                        v.getId(),
                        v.getVitalType(),
                        v.getValueNumeric(),
                        v.getUnit(),
                        v.getRecordedAt()))
                .collect(Collectors.toList());

        return ConsultationDetailDto.builder()
                .consultation(ConsultationDto.fromEntity(cons))
                .prescription(prescription)
                .invoice(invoice)
                .vitals(vitals)
                .build();
    }

    @GetMapping("/queues")
    @Operation(summary = "Trạng thái hàng chờ hiện tại")
    public List<QueueEntryDto> getActiveQueues() {
        Patient p = getAuthenticatedPatient();
        return queueService.getActiveEntriesByPatient(p.getId())
                .stream()
                .map(e -> {
                    var dto = new QueueEntryDto();
                    dto.setId(e.getId());
                    dto.setQueueDefinitionId(e.getQueueDefinition().getId());
                    dto.setQueueName(e.getQueueDefinition().getNameVi());
                    dto.setStatus(e.getStatus());
                    dto.setJoinedAt(e.getJoinedAt());
                    // Calculate people ahead
                    int ahead = (int) queueService.countPeopleAhead(e.getQueueDefinition().getId(), e.getJoinedAt());
                    dto.setPeopleAhead(ahead);
                    dto.setEstimatedWaitMinutes(ahead * 10); // Assume 10 mins per patient
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/branches")
    @Operation(summary = "Danh sách chi nhánh đang hoạt động")
    public List<TenantBranchDto> getBranches() {
        UUID tenantId = vn.clinic.patientflow.common.tenant.TenantContext.getTenantIdOrThrow();
        return tenantService.getBranchesByTenantId(tenantId).stream()
                .filter(vn.clinic.patientflow.tenant.domain.TenantBranch::getIsActive)
                .map(TenantBranchDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/slots")
    @Operation(summary = "Lấy danh sách slot khả dụng")
    public List<SlotAvailabilityDto> getSlots(@RequestParam UUID branchId, @RequestParam LocalDate date) {
        return schedulingService.getAvailableSlots(branchId, date);
    }

    @PostMapping("/appointments")
    @Operation(summary = "Đặt lịch hẹn mới")
    public AppointmentDto createAppointment(@RequestBody CreateAppointmentRequest request) {
        Patient p = getAuthenticatedPatient();
        vn.clinic.patientflow.scheduling.domain.SchedulingAppointment appointment = vn.clinic.patientflow.scheduling.domain.SchedulingAppointment
                .builder()
                .branch(new vn.clinic.patientflow.tenant.domain.TenantBranch(request.getBranchId()))
                .patient(p)
                .appointmentDate(request.getAppointmentDate())
                .slotStartTime(request.getSlotStartTime())
                .slotEndTime(request.getSlotEndTime())
                .status("SCHEDULED")
                .appointmentType(request.getAppointmentType())
                .notes(request.getNotes())
                .build();
        return AppointmentDto.fromEntity(schedulingService.createAppointment(appointment));
    }

    @PostMapping("/register-token")
    @Operation(summary = "Đăng ký FCM token cho bệnh nhân")
    public void registerToken(@RequestBody RegisterFcmTokenRequest request) {
        Patient p = getAuthenticatedPatient();
        patientNotificationService.registerToken(p, request.getToken(), request.getDeviceType());
    }

    @PostMapping("/ai-pre-triage")
    @Operation(summary = "Gợi ý phân loại AI dựa trên triệu chứng")
    public TriageSuggestionResult getPreTriage(
            @RequestBody String symptoms) {
        // Simple pre-triage with text only
        var input = AiTriageService.TriageInput.builder()
                .chiefComplaintText(symptoms)
                .ageInYears(30) // Default age if not known
                .build();
        return triageService.suggestAiTriage(input);
    }

    @GetMapping("/notifications")
    @Operation(summary = "Lấy danh sách thông báo của bệnh nhân")
    public List<PatientNotificationDto> getNotifications() {
        Patient p = getAuthenticatedPatient();
        return patientNotificationRepository.findByPatientIdOrderByCreatedAtDesc(p.getId())
                .stream().map(PatientNotificationDto::fromEntity).collect(Collectors.toList());
    }

    @PostMapping("/notifications/{id}/read")
    @Operation(summary = "Đánh dấu thông báo đã đọc")
    public void markAsRead(@PathVariable UUID id) {
        Patient p = getAuthenticatedPatient();
        var notif = patientNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        if (!notif.getPatient().getId().equals(p.getId())) {
            throw new ResourceNotFoundException("Notification", id);
        }
        notif.setRead(true);
        patientNotificationRepository.save(notif);
    }

    @PostMapping("/notifications/read-all")
    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc")
    public void markAllAsRead() {
        Patient p = getAuthenticatedPatient();
        var notifications = patientNotificationRepository.findByPatientIdOrderByCreatedAtDesc(p.getId());
        notifications.forEach(n -> n.setRead(true));
        patientNotificationRepository.saveAll(notifications);
    }

    private Patient getAuthenticatedPatient() {
        UUID userId = AuthPrincipal.getCurrentUserId();
        return patientService.getByIdentityUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient record not found for this user. Please link your profile in settings."));
    }
}
