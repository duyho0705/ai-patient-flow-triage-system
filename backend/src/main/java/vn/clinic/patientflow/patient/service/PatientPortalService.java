package vn.clinic.patientflow.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.billing.repository.InvoiceRepository;
import vn.clinic.patientflow.billing.service.PaymentService;
import vn.clinic.patientflow.clinical.repository.DiagnosticImageRepository;
import vn.clinic.patientflow.clinical.repository.LabResultRepository;
import vn.clinic.patientflow.clinical.service.ClinicalService;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.service.FileStorageService;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.service.IdentityService;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.domain.PatientInsurance;
import vn.clinic.patientflow.patient.domain.PatientRelative;
import vn.clinic.patientflow.patient.repository.PatientInsuranceRepository;
import vn.clinic.patientflow.patient.repository.PatientRelativeRepository;
import vn.clinic.patientflow.queue.service.QueueService;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;
import vn.clinic.patientflow.scheduling.service.SchedulingService;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;
import vn.clinic.patientflow.triage.repository.TriageVitalRepository;
import vn.clinic.patientflow.triage.service.TriageService;
import vn.clinic.patientflow.clinical.repository.PrescriptionRepository;
import vn.clinic.patientflow.patient.domain.PatientVitalLog;
import vn.clinic.patientflow.patient.domain.MedicationDosageLog;
import vn.clinic.patientflow.patient.repository.PatientVitalLogRepository;
import vn.clinic.patientflow.patient.repository.MedicationDosageLogRepository;
import java.util.Map;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Enterprise Orchestration Service for Patient Portal.
 * <p>
 * Single entry point for all patient portal operations.
 * Aggregates data from multiple domains (Clinical, Scheduling, Billing, Queue)
 * and enforces ownership checks for patient-specific resources.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientPortalService {

        private final PatientService patientService;
        private final SchedulingService schedulingService;
        private final ClinicalService clinicalService;
        private final TriageService triageService;
        private final QueueService queueService;
        private final IdentityService identityService;
        private final MedicationReminderService medicationReminderService;
        private final FileStorageService fileStorageService;
        private final PaymentService paymentService;

        // Repositories
        private final TriageSessionRepository triageSessionRepository;
        private final TriageVitalRepository triageVitalRepository;
        private final InvoiceRepository invoiceRepository;
        private final PrescriptionRepository prescriptionRepository;
        private final PatientRelativeRepository patientRelativeRepository;
        private final PatientInsuranceRepository patientInsuranceRepository;
        private final LabResultRepository labResultRepository;
        private final DiagnosticImageRepository diagnosticImageRepository;
        private final PatientVitalLogRepository patientVitalLogRepository;
        private final MedicationDosageLogRepository medicationDosageLogRepository;

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║ AUTHENTICATION ║
        // ╚═══════════════════════════════════════════════════════════════╝

        public Patient getAuthenticatedPatient() {
                UUID userId = AuthPrincipal.getCurrentUserId();
                return patientService.getByUserId(userId);
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║ DASHBOARD ║
        // ╚═══════════════════════════════════════════════════════════════╝

        public PatientDashboardDto getDashboardData(UUID patientId) {
                var appointments = schedulingService.getUpcomingAppointmentsByPatient(patientId);
                var recentVisits = clinicalService.getRecentConsultationsByPatient(patientId, 5);
                var activeQueues = queueService.getActiveEntriesByPatient(patientId);

                // Fetch Latest Vitals
                var latestSessions = triageSessionRepository.findByPatientIdOrderByStartedAtDesc(
                                patientId, PageRequest.of(0, 1));
                List<TriageVitalDto> lastVitals = List.of();
                if (!latestSessions.isEmpty()) {
                        lastVitals = triageService.getVitals(latestSessions.get(0).getId()).stream()
                                        .map(v -> new TriageVitalDto(v.getId(), v.getVitalType(),
                                                        v.getValueNumeric(), v.getUnit(), v.getRecordedAt()))
                                        .collect(Collectors.toList());
                }

                // Fetch Pending Invoices
                var pendingInvoices = invoiceRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(
                                patientId, "PENDING");
                InvoiceDto pendingInvoice = pendingInvoices.isEmpty() ? null
                                : InvoiceDto.fromEntity(pendingInvoices.get(0));

                return PatientDashboardDto.builder()
                                .patientId(patientId)
                                .branchId(activeQueues.isEmpty() ? null : activeQueues.get(0).getBranch().getId())
                                .activeQueues((long) activeQueues.size())
                                .nextAppointment(appointments.isEmpty() ? null
                                                : AppointmentDto.fromEntity(appointments.get(0)))
                                .recentVisits(recentVisits.stream()
                                                .map(ConsultationDto::fromEntity).collect(Collectors.toList()))
                                .lastVitals(lastVitals)
                                .latestPrescription(prescriptionRepository
                                                .findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                                                .findFirst().map(clinicalService::mapPrescriptionToDto).orElse(null))
                                .pendingInvoice(pendingInvoice)
                                .medicationReminders(medicationReminderService.getRemindersByPatient(patientId)
                                                .stream().map(MedicationReminderDto::fromEntity)
                                                .collect(Collectors.toList()))
                                .vitalHistory(getCombinedVitalHistory(patientId))
                                .healthAlerts(generateHealthAlerts(patientId))
                                .build();
        }

        private List<String> generateHealthAlerts(UUID patientId) {
                List<String> alerts = new java.util.ArrayList<>();
                List<TriageVitalDto> history = getCombinedVitalHistory(patientId);

                // Group by type and date
                Map<String, List<TriageVitalDto>> byType = history.stream()
                                .collect(Collectors.groupingBy(TriageVitalDto::vitalType));

                for (Map.Entry<String, List<TriageVitalDto>> entry : byType.entrySet()) {
                        String type = entry.getKey();
                        List<TriageVitalDto> sorted = entry.getValue().stream()
                                        .sorted((a, b) -> b.recordedAt().compareTo(a.recordedAt()))
                                        .collect(Collectors.toList());

                        if (sorted.isEmpty())
                                continue;

                        // Check if latest is abnormal
                        if (isAbnormal(sorted.get(0))) {
                                // Check if last 3 consecutive logs (potentially different days) are abnormal
                                if (sorted.size() >= 3 && isAbnormal(sorted.get(1)) && isAbnormal(sorted.get(2))) {
                                        alerts.add("Cảnh báo: Chỉ số " + getVitalLabel(type)
                                                        + " bất thường liên tiếp trong 3 lượt đo gần nhất. Vui lòng liên hệ bác sĩ.");
                                } else {
                                        alerts.add("Lưu ý: Chỉ số " + getVitalLabel(type)
                                                        + " hiện tại đang ở mức bất thường.");
                                }
                        }
                }
                return alerts;
        }

        private boolean isAbnormal(TriageVitalDto v) {
                if (v.valueNumeric() == null)
                        return false;
                double val = v.valueNumeric().doubleValue();
                switch (v.vitalType().toUpperCase()) {
                        case "BLOOD_GLUCOSE":
                                return val > 180 || val < 70;
                        case "BLOOD_PRESSURE_SYS":
                                return val > 140;
                        case "BLOOD_PRESSURE_DIA":
                                return val > 90;
                        case "HEART_RATE":
                                return val > 100 || val < 50;
                        case "SPO2":
                                return val < 94;
                        default:
                                return false;
                }
        }

        private String getVitalLabel(String type) {
                switch (type.toUpperCase()) {
                        case "BLOOD_GLUCOSE":
                                return "Đường huyết";
                        case "BLOOD_PRESSURE_SYS":
                                return "Huyết áp tâm thu";
                        case "BLOOD_PRESSURE_DIA":
                                return "Huyết áp tâm trương";
                        case "HEART_RATE":
                                return "Nhịp tim";
                        case "SPO2":
                                return "Nồng độ oxy (SpO2)";
                        default:
                                return type;
                }
        }

        private List<TriageVitalDto> getCombinedVitalHistory(UUID patientId) {
                // Clinical/Triage vitals
                var triageVitals = triageVitalRepository.findByPatientId(patientId).stream()
                                .map(v -> new TriageVitalDto(v.getId(), v.getVitalType(),
                                                v.getValueNumeric(), v.getUnit(), v.getRecordedAt()))
                                .collect(Collectors.toList());

                // Patient manual vitals
                var manualVitals = patientVitalLogRepository.findByPatientIdOrderByRecordedAtDesc(patientId).stream()
                                .map(v -> new TriageVitalDto(v.getId(), v.getVitalType(),
                                                v.getValueNumeric(), v.getUnit(), v.getRecordedAt()))
                                .collect(Collectors.toList());

                triageVitals.addAll(manualVitals);
                return triageVitals.stream()
                                .sorted((a, b) -> b.getRecordedAt().compareTo(a.getRecordedAt()))
                                .collect(Collectors.toList());
        }

        @Transactional
        public PatientVitalLogDto logVitalMetric(Patient p, PatientVitalLogDto dto) {
                var log = PatientVitalLog.builder()
                                .patient(p)
                                .vitalType(dto.getVitalType())
                                .valueNumeric(dto.getValueNumeric())
                                .unit(dto.getUnit())
                                .recordedAt(dto.getRecordedAt() != null ? dto.getRecordedAt() : Instant.now())
                                .imageUrl(dto.getImageUrl())
                                .notes(dto.getNotes())
                                .build();
                return PatientVitalLogDto.fromEntity(patientVitalLogRepository.save(log));
        }

        @Transactional
        public MedicationDosageLogDto markMedicationTaken(Patient p, MedicationDosageLogDto dto) {
                var log = MedicationDosageLog.builder()
                                .patient(p)
                                .medicineName(dto.getMedicineName())
                                .dosageInstruction(dto.getDosageInstruction())
                                .takenAt(dto.getTakenAt() != null ? dto.getTakenAt() : Instant.now())
                                .build();

                if (dto.getMedicationReminderId() != null) {
                        log.setMedicationReminder(medicationReminderService.getById(dto.getMedicationReminderId()));
                }

                return MedicationDosageLogDto.fromEntity(medicationDosageLogRepository.save(log));
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║ PROFILE MANAGEMENT ║
        // ╚═══════════════════════════════════════════════════════════════╝

        @Transactional
        public PatientDto updateProfile(UUID patientId, UpdatePatientProfileRequest request) {
                Patient p = patientService.getById(patientId);

                // Sync IdentityUser
                IdentityUser user = identityService.getUserById(p.getIdentityUserId());
                boolean userNeedsUpdate = false;

                if (request.getFullNameVi() != null
                                && !request.getFullNameVi().equals(user.getFullNameVi())) {
                        user.setFullNameVi(request.getFullNameVi());
                        userNeedsUpdate = true;
                }

                if (request.getEmail() != null
                                && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
                        if (identityService.getActiveUserByEmail(request.getEmail()) != null) {
                                throw new IllegalArgumentException("Email already in use.");
                        }
                        user.setEmail(request.getEmail().trim().toLowerCase());
                        userNeedsUpdate = true;
                }

                if (userNeedsUpdate) {
                        identityService.saveUser(user);
                }

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
                                .cccd(request.getCccd())
                                .build();

                return PatientDto.fromEntity(patientService.update(patientId, updates));
        }

        @Transactional
        public PatientDto uploadAvatar(UUID patientId, MultipartFile file) {
                String url = fileStorageService.saveAvatar(file, patientId);
                Patient updates = Patient.builder().avatarUrl(url).build();
                return PatientDto.fromEntity(patientService.update(patientId, updates));
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║ FAMILY & RELATIVES ║
        // ╚═══════════════════════════════════════════════════════════════╝

        public List<PatientRelativeDto> getFamily(Patient p) {
                return patientRelativeRepository.findByPatient(p).stream()
                                .map(PatientRelativeDto::fromEntity).collect(Collectors.toList());
        }

        @Transactional
        public PatientRelativeDto addRelative(Patient p, AddPatientRelativeRequest request) {
                var relative = PatientRelative.builder()
                                .patient(p)
                                .fullName(request.getFullName())
                                .relationship(request.getRelationship())
                                .phoneNumber(request.getPhoneNumber())
                                .gender(request.getGender())
                                .age(request.getAge())
                                .build();
                return PatientRelativeDto.fromEntity(patientRelativeRepository.save(relative));
        }

        @Transactional
        public PatientRelativeDto updateRelative(Patient p, UUID relativeId, AddPatientRelativeRequest request) {
                PatientRelative rel = patientRelativeRepository.findById(relativeId)
                                .orElseThrow(() -> new ResourceNotFoundException("PatientRelative", relativeId));
                if (!rel.getPatient().getId().equals(p.getId())) {
                        throw new ResourceNotFoundException("PatientRelative", relativeId);
                }
                if (request.getFullName() != null)
                        rel.setFullName(request.getFullName());
                if (request.getRelationship() != null)
                        rel.setRelationship(request.getRelationship());
                if (request.getPhoneNumber() != null)
                        rel.setPhoneNumber(request.getPhoneNumber());
                if (request.getGender() != null)
                        rel.setGender(request.getGender());
                if (request.getAge() != null)
                        rel.setAge(request.getAge());
                return PatientRelativeDto.fromEntity(patientRelativeRepository.save(rel));
        }

        @Transactional
        public void deleteRelative(Patient p, UUID relativeId) {
                PatientRelative rel = patientRelativeRepository.findById(relativeId)
                                .orElseThrow(() -> new ResourceNotFoundException("PatientRelative", relativeId));
                if (!rel.getPatient().getId().equals(p.getId())) {
                        throw new ResourceNotFoundException("PatientRelative", relativeId);
                }
                patientRelativeRepository.delete(rel);
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║ INSURANCE ║
        // ╚═══════════════════════════════════════════════════════════════╝

        public List<PatientInsuranceDto> getInsurances(UUID patientId) {
                return patientInsuranceRepository.findByPatientIdOrderByIsPrimaryDesc(patientId)
                                .stream().map(PatientInsuranceDto::fromEntity).collect(Collectors.toList());
        }

        @Transactional
        public PatientInsuranceDto addInsurance(Patient p, AddPatientInsuranceRequest request) {
                var insurance = PatientInsurance.builder()
                                .patient(p)
                                .insuranceType(request.getInsuranceType())
                                .insuranceNumber(request.getInsuranceNumber())
                                .holderName(request.getHolderName())
                                .validFrom(request.getValidFrom())
                                .validTo(request.getValidTo())
                                .isPrimary(request.getIsPrimary())
                                .build();
                return PatientInsuranceDto.fromEntity(patientInsuranceRepository.save(insurance));
        }

        @Transactional
        public void deleteInsurance(Patient p, UUID insuranceId) {
                PatientInsurance ins = patientInsuranceRepository.findById(insuranceId)
                                .orElseThrow(() -> new ResourceNotFoundException("PatientInsurance", insuranceId));
                if (!ins.getPatient().getId().equals(p.getId())) {
                        throw new ResourceNotFoundException("PatientInsurance", insuranceId);
                }
                patientInsuranceRepository.delete(ins);
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║ APPOINTMENTS ║
        // ╚═══════════════════════════════════════════════════════════════╝

        @Transactional
        public AppointmentDto createAppointment(Patient p, CreateAppointmentRequest request) {
                UUID targetId = request.getPatientId() != null ? request.getPatientId() : p.getId();
                var appointment = SchedulingAppointment.builder()
                                .tenant(p.getTenant())
                                .branch(new TenantBranch(request.getBranchId()))
                                .patient(new Patient(targetId))
                                .appointmentDate(request.getAppointmentDate())
                                .slotStartTime(request.getSlotStartTime())
                                .slotEndTime(request.getSlotEndTime())
                                .status("SCHEDULED")
                                .appointmentType(request.getAppointmentType())
                                .notes(request.getNotes())
                                .build();
                return AppointmentDto.fromEntity(schedulingService.createAppointment(appointment));
        }

        @Transactional
        public AppointmentDto cancelAppointment(UUID patientId, UUID appointmentId) {
                var appt = schedulingService.getAppointmentById(appointmentId);
                if (!appt.getPatient().getId().equals(patientId)) {
                        throw new ResourceNotFoundException("Appointment", appointmentId);
                }
                return AppointmentDto.fromEntity(
                                schedulingService.updateAppointmentStatus(appointmentId, "CANCELLED"));
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║ CLINICAL / MEDICAL HISTORY ║
        // ╚═══════════════════════════════════════════════════════════════╝

        public PagedResponse<ConsultationDto> getMedicalHistory(UUID patientId, int page, int size) {
                var pageResult = clinicalService
                                .getConsultationsByPatientPageable(patientId, PageRequest.of(page, size))
                                .map(ConsultationDto::fromEntity);
                return PagedResponse.of(pageResult);
        }

        public ConsultationDetailDto getConsultationDetail(UUID patientId, UUID consultationId) {
                var cons = clinicalService.getById(consultationId);
                if (!cons.getPatient().getId().equals(patientId)) {
                        throw new ResourceNotFoundException("Consultation", consultationId);
                }

                var prescription = clinicalService.getPrescriptionByConsultation(consultationId)
                                .map(clinicalService::mapPrescriptionToDto).orElse(null);

                List<TriageVitalDto> vitals = List.of();
                if (cons.getQueueEntry() != null && cons.getQueueEntry().getTriageSession() != null) {
                        vitals = triageService.getVitals(cons.getQueueEntry().getTriageSession().getId())
                                        .stream()
                                        .map(v -> new TriageVitalDto(v.getId(), v.getVitalType(),
                                                        v.getValueNumeric(), v.getUnit(), v.getRecordedAt()))
                                        .collect(Collectors.toList());
                }

                var labResults = labResultRepository.findByConsultation(cons).stream()
                                .map(LabResultDto::fromEntity).collect(Collectors.toList());

                var images = diagnosticImageRepository.findByConsultation(cons).stream()
                                .map(DiagnosticImageDto::fromEntity).collect(Collectors.toList());

                return ConsultationDetailDto.builder()
                                .consultation(ConsultationDto.fromEntity(cons))
                                .prescription(prescription)
                                .vitals(vitals)
                                .labResults(labResults)
                                .diagnosticImages(images)
                                .build();
        }

        public List<VitalTrendDto> getVitalTrends(UUID patientId, String type) {
                return triageVitalRepository.findByPatientId(patientId).stream()
                                .filter(v -> v.getVitalType().equalsIgnoreCase(type))
                                .map(v -> VitalTrendDto.builder()
                                                .type(v.getVitalType())
                                                .value(v.getValueNumeric())
                                                .recordedAt(v.getRecordedAt())
                                                .build())
                                .collect(Collectors.toList());
        }

        public List<QueueEntryDto> getActiveQueues(UUID patientId) {
                return queueService.getActiveEntriesByPatient(patientId).stream().map(e -> {
                        var dto = new QueueEntryDto();
                        dto.setId(e.getId());
                        dto.setQueueName(e.getQueueDefinition().getNameVi());
                        dto.setStatus(e.getStatus());
                        dto.setJoinedAt(e.getJoinedAt());

                        int ahead = (int) queueService.countPeopleAhead(
                                        e.getQueueDefinition().getId(), e.getJoinedAt());
                        dto.setPeopleAhead(ahead);

                        int avgTime = e.getQueueDefinition().getAverageConsultationMinutes() != null
                                        ? e.getQueueDefinition().getAverageConsultationMinutes()
                                        : 10;
                        dto.setEstimatedWaitMinutes(ahead * avgTime);
                        return dto;
                }).collect(Collectors.toList());
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║ BILLING ║
        // ╚═══════════════════════════════════════════════════════════════╝

        public PagedResponse<InvoiceDto> getInvoices(UUID patientId, int page, int size) {
                var pageResult = invoiceRepository
                                .findByPatientIdOrderByCreatedAtDesc(patientId, PageRequest.of(page, size))
                                .map(InvoiceDto::fromEntity);
                return PagedResponse.of(pageResult);
        }

        @Transactional
        public InvoiceDto payInvoice(UUID patientId, UUID invoiceId, String paymentMethod) {
                var invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));

                if (!invoice.getPatient().getId().equals(patientId)) {
                        throw new ResourceNotFoundException("Invoice", invoiceId);
                }

                invoice.setStatus("PAID");
                invoice.setPaymentMethod(paymentMethod.replace("\"", ""));
                invoice.setPaidAt(Instant.now());
                return InvoiceDto.fromEntity(invoiceRepository.save(invoice));
        }

        public String getVnpayUrl(UUID patientId, UUID invoiceId, String returnUrl) {
                var invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));
                if (!invoice.getPatient().getId().equals(patientId)) {
                        throw new ResourceNotFoundException("Invoice", invoiceId);
                }
                return paymentService.createVnpayPaymentUrl(invoice, returnUrl);
        }
}
