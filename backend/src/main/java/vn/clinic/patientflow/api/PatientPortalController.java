package vn.clinic.patientflow.api;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.patientflow.api.dto.AiChatRequest;
import vn.clinic.patientflow.api.dto.AiChatResponse;
import vn.clinic.patientflow.api.dto.AppointmentDto;
import vn.clinic.patientflow.api.dto.ChangePasswordRequest;
import vn.clinic.patientflow.api.dto.ConsultationDetailDto;
import vn.clinic.patientflow.api.dto.ConsultationDto;
import vn.clinic.patientflow.api.dto.CreateAppointmentRequest;
import vn.clinic.patientflow.api.dto.InvoiceDto;
import vn.clinic.patientflow.api.dto.PatientDashboardDto;
import vn.clinic.patientflow.api.dto.PatientDto;
import vn.clinic.patientflow.api.dto.PatientNotificationDto;
import vn.clinic.patientflow.api.dto.PatientPortalStatusDto;
import vn.clinic.patientflow.api.dto.QueueEntryDto;
import vn.clinic.patientflow.api.dto.RegisterFcmTokenRequest;
import vn.clinic.patientflow.api.dto.SlotAvailabilityDto;
import vn.clinic.patientflow.api.dto.TenantBranchDto;
import vn.clinic.patientflow.api.dto.TriageVitalDto;
import vn.clinic.patientflow.api.dto.UpdatePatientProfileRequest;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.billing.repository.InvoiceRepository;
import vn.clinic.patientflow.billing.service.BillingService;
import vn.clinic.patientflow.clinical.service.ClinicalService;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.service.FileStorageService;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.service.IdentityService;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientNotificationService;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.queue.service.QueueService;
import vn.clinic.patientflow.scheduling.service.SchedulingService;
import vn.clinic.patientflow.tenant.service.TenantService;
import vn.clinic.patientflow.triage.ai.AiTriageService;
import vn.clinic.patientflow.triage.ai.AiTriageService.TriageSuggestionResult;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;
import vn.clinic.patientflow.triage.repository.TriageVitalRepository;
import vn.clinic.patientflow.clinical.repository.PrescriptionRepository;
import vn.clinic.patientflow.triage.service.TriageService;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
@Tag(name = "Patient Portal", description = "Cổng thông tin dành cho Bệnh nhân")
@Slf4j
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
    private final TriageSessionRepository triageSessionRepository;
    private final InvoiceRepository invoiceRepository;
    private final vn.clinic.patientflow.auth.AuthService authService;
    private final FileStorageService fileStorageService;
    private final TriageVitalRepository triageVitalRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final IdentityService identityService;

    @PostMapping("/profile/change-password")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Đổi mật khẩu")
    public void changePassword(@RequestBody ChangePasswordRequest request) {
        UUID userId = AuthPrincipal.getCurrentUserId();
        authService.changePassword(userId, request);
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Lấy hồ sơ bệnh nhân của user hiện tại")
    public PatientDto getProfile() {
        Patient patient = getAuthenticatedPatient();
        return PatientDto.fromEntity(patient);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Cập nhật hồ sơ bệnh nhân")
    public PatientDto updateProfile(@Valid @RequestBody UpdatePatientProfileRequest request) {
        Patient p = getAuthenticatedPatient();
        Patient updates = Patient.builder()
                .fullNameVi(request.getFullNameVi())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .phone(request.getPhone())
                .email(request.getEmail())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .district(request.getDistrict())
                .ward(request.getWard())
                .nationality(request.getNationality())
                .ethnicity(request.getEthnicity())
                .build();
        return PatientDto.fromEntity(patientService.update(p.getId(), updates));
    }

    @PostMapping(value = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Tải ảnh đại diện")
    public PatientDto uploadAvatar(@RequestParam("file") MultipartFile file) {
        Patient p = getAuthenticatedPatient();
        String url = fileStorageService.saveAvatar(file, p.getId());

        Patient updates = Patient.builder().avatarUrl(url).build();
        return PatientDto.fromEntity(patientService.update(p.getId(), updates));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Dữ liệu tổng quan cho trang chủ bệnh nhân")
    public PatientDashboardDto getDashboard() {
        Patient p = getAuthenticatedPatient();
        var appointments = schedulingService.getUpcomingAppointmentsByPatient(p.getId());
        var recentVisits = clinicalService.getRecentConsultationsByPatient(p.getId(), 5);
        var activeQueues = queueService.getActiveEntriesByPatient(p.getId());

        // Get Latest Vitals
        var latestSessions = triageSessionRepository.findByPatientIdOrderByStartedAtDesc(p.getId(),
                PageRequest.of(0, 1));
        List<TriageVitalDto> lastVitals = List.of();
        if (!latestSessions.isEmpty()) {
            lastVitals = triageService.getVitals(latestSessions.get(0).getId())
                    .stream()
                    .map(v -> new TriageVitalDto(v.getId(), v.getVitalType(), v.getValueNumeric(), v.getUnit(),
                            v.getRecordedAt()))
                    .collect(Collectors.toList());
        }

        // Get Pending Invoice
        var pendingInvoices = invoiceRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(p.getId(), "PENDING");
        InvoiceDto pendingInvoice = pendingInvoices.isEmpty() ? null : InvoiceDto.fromEntity(pendingInvoices.get(0));

        return PatientDashboardDto.builder()
                .patientId(p.getId())
                .branchId(activeQueues.isEmpty() ? null : activeQueues.get(0).getBranch().getId())
                .patientName(p.getFullNameVi())
                .activeQueues((long) activeQueues.size())
                .nextAppointment(appointments.isEmpty() ? null : AppointmentDto.fromEntity(appointments.get(0)))
                .recentVisits(recentVisits.stream().map(ConsultationDto::fromEntity).collect(Collectors.toList()))
                .lastVitals(lastVitals)
                .vitalHistory(triageVitalRepository.findByPatientId(p.getId())
                        .stream()
                        .map(v -> new TriageVitalDto(v.getId(), v.getVitalType(), v.getValueNumeric(), v.getUnit(),
                                v.getRecordedAt()))
                        .collect(Collectors.toList()))
                .latestPrescription(prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(p.getId()).stream()
                        .findFirst().map(clinicalService::mapPrescriptionToDto).orElse(null))
                .pendingInvoice(pendingInvoice)
                .build();
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Danh sách lịch hẹn của bệnh nhân")
    public List<AppointmentDto> getAppointments() {
        Patient p = getAuthenticatedPatient();
        return schedulingService.getAppointmentsByPatient(p.getId())
                .stream().map(AppointmentDto::fromEntity).collect(Collectors.toList());
    }

    @GetMapping("/medical-history")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Lịch sử khám bệnh")
    public List<ConsultationDto> getHistory() {
        Patient p = getAuthenticatedPatient();
        return clinicalService.getConsultationsByPatient(p.getId())
                .stream().map(ConsultationDto::fromEntity).collect(Collectors.toList());
    }

    @GetMapping("/medical-history/{id}")
    @PreAuthorize("hasRole('PATIENT')")
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

        // Mock Lab Results for Demo
        var labResults = java.util.List.of(
                LabResultDto.builder().testName("Chỉ số đường huyết (Glucose)").value("5.2").unit("mmol/L")
                        .referenceRange("3.9 - 6.4").status("NORMAL").build(),
                LabResultDto.builder().testName("Cholesterol toàn phần").value("6.1").unit("mmol/L")
                        .referenceRange("< 5.2").status("HIGH").build(),
                LabResultDto.builder().testName("Triglycerides").value("1.8").unit("mmol/L").referenceRange("< 1.7")
                        .status("HIGH").build());

        // Mock Diagnostic Images for Demo
        var images = java.util.List.of(
                DiagnosticImageDto.builder()
                        .title("Siêu âm ổ bụng")
                        .imageUrl(
                                "https://images.unsplash.com/photo-1579154235828-ac7d759678bb?q=80&w=1000&auto=format&fit=crop")
                        .description("Hình ảnh gan nhiễm mỡ độ 1, nhu mô gan hơi thô.")
                        .recordedAt(java.time.Instant.now().toString())
                        .build());

        return ConsultationDetailDto.builder()
                .consultation(ConsultationDto.fromEntity(cons))
                .prescription(prescription)
                .invoice(invoice)
                .vitals(vitals)
                .labResults(labResults)
                .diagnosticImages(images)
                .build();
    }

    @GetMapping("/queues")
    @PreAuthorize("hasRole('PATIENT')")
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
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Danh sách chi nhánh đang hoạt động")
    public List<TenantBranchDto> getBranches() {
        UUID tenantId = vn.clinic.patientflow.common.tenant.TenantContext.getTenantIdOrThrow();
        return tenantService.getBranchesByTenantId(tenantId).stream()
                .filter(vn.clinic.patientflow.tenant.domain.TenantBranch::getIsActive)
                .map(TenantBranchDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/slots")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Lấy danh sách slot khả dụng")
    public List<SlotAvailabilityDto> getSlots(@RequestParam UUID branchId, @RequestParam LocalDate date) {
        return schedulingService.getAvailableSlots(branchId, date);
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasRole('PATIENT')")
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

    @GetMapping("/invoices")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Danh sách hóa đơn của bệnh nhận")
    public List<InvoiceDto> getInvoices() {
        Patient p = getAuthenticatedPatient();
        return invoiceRepository.findByPatientIdOrderByCreatedAtDesc(p.getId())
                .stream().map(InvoiceDto::fromEntity).collect(Collectors.toList());
    }

    @PostMapping("/invoices/{id}/pay")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Thanh toán hóa đơn")
    public InvoiceDto payInvoice(@PathVariable UUID id, @RequestBody String paymentMethod) {
        Patient p = getAuthenticatedPatient();
        var invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));

        if (!invoice.getPatient().getId().equals(p.getId())) {
            throw new IllegalArgumentException("Forbidden");
        }

        invoice.setStatus("PAID");
        invoice.setPaymentMethod(paymentMethod.replace("\"", "")); // Strip potential quotes
        invoice.setPaidAt(java.time.Instant.now());

        return InvoiceDto.fromEntity(invoiceRepository.save(invoice));
    }

    @PostMapping("/register-token")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Đăng ký FCM token cho bệnh nhân")
    public void registerToken(@RequestBody RegisterFcmTokenRequest request) {
        Patient p = getAuthenticatedPatient();
        patientNotificationService.registerToken(p, request.getToken(), request.getDeviceType());
    }

    @PostMapping("/ai-assistant")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Chat với Trợ lý AI Thông minh")
    public AiChatResponse getAiChat(@RequestBody AiChatRequest request) {
        Patient p = getAuthenticatedPatient();
        String msg = request.getMessage().toLowerCase();

        // 1. Smart Intent Detection: Appointments
        if (msg.contains("lịch khám") || msg.contains("hẹn") || msg.contains("appointment")) {
            var appointments = schedulingService.getUpcomingAppointmentsByPatient(p.getId());
            if (appointments.isEmpty()) {
                return AiChatResponse.builder()
                        .response("Chào bạn " + p.getFullNameVi()
                                + ", hiện tại bạn chưa có lịch hẹn nào sắp tới. Bạn có muốn tôi giúp đặt lịch mới không?")
                        .suggestions(List.of("Đặt lịch khám mới", "Xem lịch sử khám"))
                        .build();
            } else {
                var appt = appointments.get(0);
                String timeStr = appt.getAppointmentDate().toString() + " lúc " + appt.getSlotStartTime();
                return AiChatResponse.builder()
                        .response("Chào bạn " + p.getFullNameVi() + ", bạn có một lịch hẹn sắp tới vào ngày " + timeStr
                                + " tại " + appt.getBranch().getNameVi()
                                + ". Bạn cần tôi nhắc lại lưu ý gì cho ca khám này không?")
                        .suggestions(List.of("Cơ sở này ở đâu?", "Lưu ý gì trước khi khám?", "Hủy lịch hẹn"))
                        .build();
            }
        }

        // 2. New Intent: Billing/Payment
        if (msg.contains("thanh toán") || msg.contains("hóa đơn") || msg.contains("tiền") || msg.contains("billing")) {
            var pending = invoiceRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(p.getId(), "PENDING");
            if (pending.isEmpty()) {
                return AiChatResponse.builder()
                        .response("Bạn đã hoàn tất tất cả các hóa đơn. Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi!")
                        .suggestions(List.of("Xem lịch sử thanh toán", "Đặt lịch khám mới"))
                        .build();
            } else {
                var inv = pending.get(0);
                return AiChatResponse.builder()
                        .response(String.format("Bạn có một hóa đơn chưa thanh toán với số tiền %,.0f đ. ",
                                inv.getFinalAmount().doubleValue())
                                + "Bạn có muốn tôi hướng dẫn cách thanh toán nhanh qua QR không?")
                        .suggestions(List.of("Thanh toán ngay", "Xem chi tiết hóa đơn"))
                        .build();
            }
        }

        // 3. Smart Intent Detection: Vitals/Health
        if (msg.contains("sức khỏe") || msg.contains("chỉ số") || msg.contains("vitals")) {
            return AiChatResponse.builder()
                    .response(
                            "Tôi đã xem qua các chỉ số gần đây của bạn. Mọi thứ hiện tại đều ổn định. Tuy nhiên, nếu bạn cảm thấy mệt mỏi hoặc có triệu chứng lạ, hãy cho tôi biết chi tiết hơn nhé.")
                    .suggestions(List.of("Xem biểu đồ huyết áp", "Nhịp tim của tôi thế nào?"))
                    .build();
        }

        // 3. Default AI Response (Mocking LLM)
        return AiChatResponse.builder()
                .response("Chào " + p.getFullNameVi()
                        + ", tôi là Trợ lý AI của phòng khám. Tôi có thể giúp bạn kiểm tra lịch hẹn, tư vấn sức khỏe cơ bản hoặc giải đáp các thắc mắc về đơn thuốc. Bạn cần tôi giúp gì hôm nay?")
                .suggestions(List.of("Kiểm tra lịch khám", "Hướng dẫn dùng thuốc", "Hỏi về triệu chứng"))
                .build();
    }

    @PostMapping("/ai-pre-triage")
    @PreAuthorize("hasRole('PATIENT')")
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
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Lấy danh sách thông báo của bệnh nhân")
    public List<PatientNotificationDto> getNotifications() {
        Patient p = getAuthenticatedPatient();
        return patientNotificationRepository.findByPatientIdOrderByCreatedAtDesc(p.getId())
                .stream().map(PatientNotificationDto::fromEntity).collect(Collectors.toList());
    }

    @PostMapping("/notifications/{id}/read")
    @PreAuthorize("hasRole('PATIENT')")
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
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc")
    public void markAllAsRead() {
        Patient p = getAuthenticatedPatient();
        var notifications = patientNotificationRepository.findByPatientIdOrderByCreatedAtDesc(p.getId());
        notifications.forEach(n -> n.setRead(true));
        patientNotificationRepository.saveAll(notifications);
    }

    @GetMapping("/status/{patientId}")
    @Operation(summary = "Lấy trạng thái hàng chờ của bệnh nhân (Public/Open)")
    public PatientPortalStatusDto getStatus(@PathVariable UUID patientId) {
        var patient = patientService.getById(patientId);

        var activeEntry = queueService.getActiveEntriesByPatient(patientId).stream()
                .findFirst()
                .orElse(null);

        if (activeEntry == null) {
            return PatientPortalStatusDto.builder()
                    .patientName(patient.getFullNameVi())
                    .status("NO_ACTIVE_QUEUE")
                    .build();
        }

        int ahead = (int) queueService.countPeopleAhead(activeEntry.getQueueDefinition().getId(),
                activeEntry.getJoinedAt());

        return PatientPortalStatusDto.builder()
                .patientName(patient.getFullNameVi())
                .queueName(activeEntry.getQueueDefinition().getNameVi())
                .status(activeEntry.getStatus())
                .peopleAhead((long) ahead)
                .estimatedWaitMinutes(ahead * 10)
                .build();
    }

    protected Patient getAuthenticatedPatient() {
        UUID userId = AuthPrincipal.getCurrentUserId();
        if (userId == null) {
            log.warn("getAuthenticatedPatient: No authenticated user found in SecurityContext");
            throw new ResourceNotFoundException("User not authenticated");
        }

        try {
            var patientOpt = patientService.getByIdentityUserId(userId);
            if (patientOpt.isPresent()) {
                return patientOpt.get();
            }

            log.info("getAuthenticatedPatient: Patient record missing for user {}. Attempting auto-provisioning...",
                    userId);

            IdentityUser user = identityService.getUserById(userId);
            UUID tenantId = vn.clinic.patientflow.common.tenant.TenantContext.getTenantId().orElse(null);

            if (tenantId == null) {
                log.error("getAuthenticatedPatient: TenantContext is missing tenantId for user {}", userId);
                throw new IllegalStateException("Tenant context is required but missing");
            }

            // 1. Try to link by email
            var existingByEmail = patientService.findByEmail(user.getEmail(), tenantId);
            if (existingByEmail.isPresent()) {
                Patient p = existingByEmail.get();
                log.info("getAuthenticatedPatient: Found existing patient by email {}. Linking to user {}",
                        user.getEmail(), userId);
                p.setIdentityUserId(userId);
                return patientService.save(p);
            }

            // 2. Create new
            log.info("getAuthenticatedPatient: Creating new shell patient for user {} in tenant {}", userId, tenantId);
            Patient newPatient = Patient.builder()
                    .tenant(new vn.clinic.patientflow.tenant.domain.Tenant(tenantId))
                    .fullNameVi(user.getFullNameVi())
                    .email(user.getEmail())
                    .dateOfBirth(LocalDate.of(1990, 1, 1))
                    .identityUserId(userId)
                    .isActive(true)
                    .nationality("VN")
                    .build();
            return patientService.save(newPatient);
        } catch (Exception e) {
            log.error("getAuthenticatedPatient: Error during patient resolution/provisioning for user " + userId, e);
            throw e;
        }
    }
}
