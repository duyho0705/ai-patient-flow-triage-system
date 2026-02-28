package vn.clinic.cdm.patient.service;

import vn.clinic.cdm.api.dto.patient.PatientDashboardDto;
import vn.clinic.cdm.api.dto.patient.PatientVitalLogDto;
import vn.clinic.cdm.api.dto.patient.PatientDto;
import vn.clinic.cdm.api.dto.patient.UpdatePatientProfileRequest;
import vn.clinic.cdm.api.dto.patient.PatientRelativeDto;
import vn.clinic.cdm.api.dto.patient.AddPatientRelativeRequest;
import vn.clinic.cdm.api.dto.patient.PatientInsuranceDto;
import vn.clinic.cdm.api.dto.patient.AddPatientInsuranceRequest;
import vn.clinic.cdm.api.dto.clinical.ConsultationDto;
import vn.clinic.cdm.api.dto.clinical.ConsultationDetailDto;
import vn.clinic.cdm.api.dto.clinical.VitalTrendDto;
import vn.clinic.cdm.api.dto.clinical.TriageVitalDto;
import vn.clinic.cdm.api.dto.clinical.LabResultDto;
import vn.clinic.cdm.api.dto.clinical.DiagnosticImageDto;
import vn.clinic.cdm.api.dto.medication.MedicationReminderDto;
import vn.clinic.cdm.api.dto.medication.MedicationDosageLogDto;
import vn.clinic.cdm.api.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.api.dto.scheduling.CreateAppointmentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.billing.service.BillingService;
import vn.clinic.cdm.clinical.repository.DiagnosticImageRepository;
import vn.clinic.cdm.clinical.repository.LabResultRepository;
import vn.clinic.cdm.clinical.service.ClinicalService;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;
import vn.clinic.cdm.api.dto.common.PagedResponse;
import vn.clinic.cdm.common.service.FileStorageService;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.identity.service.IdentityService;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.domain.PatientInsurance;
import vn.clinic.cdm.patient.domain.PatientRelative;
import vn.clinic.cdm.patient.repository.PatientInsuranceRepository;
import vn.clinic.cdm.patient.repository.PatientRelativeRepository;
import vn.clinic.cdm.scheduling.domain.SchedulingAppointment;
import vn.clinic.cdm.scheduling.service.SchedulingService;
import vn.clinic.cdm.tenant.domain.TenantBranch;
import vn.clinic.cdm.clinical.repository.HealthMetricRepository;
import vn.clinic.cdm.clinical.service.MedicationService;
import vn.clinic.cdm.clinical.domain.HealthMetric;
import vn.clinic.cdm.clinical.service.MedicationMapper;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Orchestration Service for Chronic Disease Management (CDM) Patient Portal.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientPortalService {
        private final MedicationMapper medicationMapper;

        private final PatientService patientService;
        private final SchedulingService schedulingService;
        private final ClinicalService clinicalService;
        private final IdentityService identityService;
        private final MedicationService medicationService;
        private final FileStorageService fileStorageService;
        private final BillingService billingService;

        // Repositories
        private final vn.clinic.cdm.clinical.repository.PrescriptionRepository prescriptionRepository;
        private final PatientRelativeRepository patientRelativeRepository;
        private final PatientInsuranceRepository patientInsuranceRepository;
        private final LabResultRepository labResultRepository;
        private final DiagnosticImageRepository diagnosticImageRepository;
        private final HealthMetricRepository healthMetricRepository;

        public Patient getAuthenticatedPatient() {
                UUID userId = AuthPrincipal.getCurrentUserId();
                return patientService.getByUserId(userId);
        }

        public PatientDashboardDto getDashboardData(UUID patientId) {
                Patient p = patientService.getById(patientId);
                var appointments = schedulingService.getUpcomingAppointmentsByPatient(patientId);
                var recentVisits = clinicalService.getRecentConsultationsByPatient(patientId, 5);

                return PatientDashboardDto.builder()
                                .patientId(patientId)
                                .patientName(p.getFullNameVi())
                                .patientAvatar(p.getAvatarUrl())
                                .activeQueues(0)
                                .nextAppointment(appointments.isEmpty() ? null
                                                : AppointmentDto.fromEntity(appointments.get(0)))
                                .recentVisits(recentVisits.stream()
                                                .map(ConsultationDto::fromEntity).collect(Collectors.toList()))
                                .lastVitals(getLatestVitals(patientId))
                                .vitalHistory(getCombinedVitalHistory(patientId))
                                .latestPrescription(prescriptionRepository
                                                .findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                                                .findFirst().map(clinicalService::mapPrescriptionToDto).orElse(null))
                                .pendingInvoice(billingService.getInvoicesByPatient(patientId).stream()
                                                .filter(inv -> "PENDING".equals(inv.getStatus()))
                                                .findFirst().orElse(null))
                                .medicationReminders(medicationService.getDailySchedules(patientId)
                                                .stream().map(medicationMapper::toReminderDto)
                                                .collect(Collectors.toList()))
                                .healthAlerts(generateHealthAlerts(patientId))
                                .vitalTrends(new java.util.ArrayList<>())
                                .bloodType(p.getBloodType())
                                .chronicConditions(p.getChronicConditions())
                                .assignedDoctorName(p.getAssignedDoctor() != null
                                                && p.getAssignedDoctor().getIdentityUser() != null
                                                                ? p.getAssignedDoctor().getIdentityUser()
                                                                                .getFullNameVi()
                                                                : null)
                                .build();
        }

        private List<TriageVitalDto> getLatestVitals(UUID patientId) {
                var latestLogs = healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
                Map<String, List<HealthMetric>> byType = latestLogs.stream()
                                .collect(Collectors.groupingBy(HealthMetric::getMetricType));

                return byType.values().stream()
                                .map(list -> list.get(0))
                                .map(v -> new TriageVitalDto(v.getId(), v.getMetricType(),
                                                v.getValue(), v.getUnit(), v.getRecordedAt()))
                                .collect(Collectors.toList());
        }

        private List<String> generateHealthAlerts(UUID patientId) {
                List<String> alerts = new java.util.ArrayList<>();
                List<TriageVitalDto> history = getCombinedVitalHistory(patientId);

                Map<String, List<TriageVitalDto>> byType = history.stream()
                                .collect(Collectors.groupingBy(TriageVitalDto::vitalType));

                for (Map.Entry<String, List<TriageVitalDto>> entry : byType.entrySet()) {
                        String type = entry.getKey();
                        List<TriageVitalDto> sorted = entry.getValue().stream()
                                        .sorted((a, b) -> b.recordedAt().compareTo(a.recordedAt()))
                                        .collect(Collectors.toList());

                        if (sorted.isEmpty())
                                continue;

                        if (isAbnormal(sorted.get(0))) {
                                if (sorted.size() >= 3 && isAbnormal(sorted.get(1)) && isAbnormal(sorted.get(2))) {
                                        alerts.add("Cáº£nh bÃ¡o: Chá»‰ sá»‘ " + getVitalLabel(type)
                                                        + " báº¥t thÆ°á»ng liÃªn tiáº¿p trong 3 lÆ°á»£t Ä‘o gáº§n nháº¥t.");
                                } else {
                                        alerts.add("LÆ°u Ã½: Chá»‰ sá»‘ " + getVitalLabel(type)
                                                        + " hiá»‡n táº¡i Ä‘ang á»Ÿ má»©c báº¥t thÆ°á»ng.");
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
                                return "ÄÆ°á»ng huyáº¿t";
                        case "BLOOD_PRESSURE_SYS":
                                return "Huyáº¿t Ã¡p tÃ¢m thu";
                        case "BLOOD_PRESSURE_DIA":
                                return "Huyáº¿t Ã¡p tÃ¢m trÆ°Æ¡ng";
                        case "HEART_RATE":
                                return "Nhá»‹p tim";
                        case "SPO2":
                                return "SpO2";
                        default:
                                return type;
                }
        }

        private List<TriageVitalDto> getCombinedVitalHistory(UUID patientId) {
                return healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId).stream()
                                .map(v -> new TriageVitalDto(v.getId(), v.getMetricType(),
                                                v.getValue(), v.getUnit(), v.getRecordedAt()))
                                .collect(Collectors.toList());
        }

        @Transactional
        public PatientVitalLogDto logVitalMetric(Patient p, PatientVitalLogDto dto) {
                var log = HealthMetric.builder()
                                .patient(p)
                                .metricType(dto.getVitalType())
                                .value(dto.getValueNumeric())
                                .unit(dto.getUnit())
                                .recordedAt(dto.getRecordedAt() != null ? dto.getRecordedAt() : Instant.now())
                                .imageUrl(dto.getImageUrl())
                                .notes(dto.getNotes())
                                .build();
                var saved = healthMetricRepository.save(log);
                return PatientVitalLogDto.builder()
                                .id(saved.getId())
                                .vitalType(saved.getMetricType())
                                .valueNumeric(saved.getValue())
                                .unit(saved.getUnit())
                                .recordedAt(saved.getRecordedAt())
                                .notes(saved.getNotes())
                                .build();
        }

        @Transactional
        public MedicationDosageLogDto markMedicationTaken(Patient p, MedicationDosageLogDto dto) {
                if (dto.getMedicationReminderId() != null) {
                        medicationService.recordDose(dto.getMedicationReminderId(), "TAKEN",
                                        "Ghi nháº­n bá»Ÿi bá»‡nh nhÃ¢n");
                }
                return dto;
        }

        @Transactional
        public PatientDto updateProfile(UUID patientId, UpdatePatientProfileRequest request) {
                Patient p = patientService.getById(patientId);
                IdentityUser user = identityService.getUserById(p.getIdentityUserId());
                boolean userNeedsUpdate = false;

                if (request.getFullNameVi() != null && !request.getFullNameVi().equals(user.getFullNameVi())) {
                        user.setFullNameVi(request.getFullNameVi());
                        userNeedsUpdate = true;
                }
                if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
                        user.setEmail(request.getEmail().trim().toLowerCase());
                        userNeedsUpdate = true;
                }
                if (userNeedsUpdate)
                        identityService.saveUser(user);

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
                if (!rel.getPatient().getId().equals(p.getId()))
                        throw new ResourceNotFoundException("PatientRelative", relativeId);

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
                PatientRelative rel = patientRelativeRepository.findById(relativeId).orElseThrow();
                patientRelativeRepository.delete(rel);
        }

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
                PatientInsurance ins = patientInsuranceRepository.findById(insuranceId).orElseThrow();
                patientInsuranceRepository.delete(ins);
        }

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
                return AppointmentDto.fromEntity(schedulingService.updateAppointmentStatus(appointmentId, "CANCELLED"));
        }

        public PagedResponse<ConsultationDto> getMedicalHistory(UUID patientId, int page, int size) {
                var pageResult = clinicalService
                                .getConsultationsByPatientPageable(patientId, PageRequest.of(page, size))
                                .map(ConsultationDto::fromEntity);
                return PagedResponse.of(pageResult);
        }

        public ConsultationDetailDto getConsultationDetail(UUID patientId, UUID consultationId) {
                var cons = clinicalService.getById(consultationId);
                var prescription = clinicalService.getPrescriptionByConsultation(consultationId)
                                .map(clinicalService::mapPrescriptionToDto).orElse(null);
                var labResults = labResultRepository.findByConsultation(cons).stream()
                                .map(LabResultDto::fromEntity).collect(Collectors.toList());
                var images = diagnosticImageRepository.findByConsultation(cons).stream()
                                .map(DiagnosticImageDto::fromEntity).collect(Collectors.toList());

                return ConsultationDetailDto.builder()
                                .consultation(ConsultationDto.fromEntity(cons))
                                .prescription(prescription)
                                .labResults(labResults)
                                .diagnosticImages(images)
                                .build();
        }

        public List<VitalTrendDto> getVitalTrends(UUID patientId, String type) {
                return healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId).stream()
                                .filter(v -> v.getMetricType().equalsIgnoreCase(type))
                                .map(v -> VitalTrendDto.builder()
                                                .type(v.getMetricType())
                                                .value(v.getValue())
                                                .recordedAt(v.getRecordedAt())
                                                .build())
                                .collect(Collectors.toList());
        }

        public List<VitalTrendDto> getVitalTrendsFiltered(UUID patientId, String type, Instant from, Instant to) {
                return healthMetricRepository
                                .findByPatientIdAndMetricTypeAndRecordedAtBetweenOrderByRecordedAtAsc(
                                                patientId, type, from, to)
                                .stream()
                                .map(v -> VitalTrendDto.builder()
                                                .type(v.getMetricType())
                                                .value(v.getValue())
                                                .recordedAt(v.getRecordedAt())
                                                .build())
                                .collect(Collectors.toList());
        }

        @Transactional
        public PatientVitalLogDto logVitalWithImage(Patient p, PatientVitalLogDto dto, MultipartFile image) {
                String imageUrl = null;
                if (image != null && !image.isEmpty())
                        imageUrl = fileStorageService.saveVitalImage(image, p.getId());

                var log = HealthMetric.builder()
                                .patient(p)
                                .metricType(dto.getVitalType())
                                .value(dto.getValueNumeric())
                                .unit(dto.getUnit())
                                .recordedAt(dto.getRecordedAt() != null ? dto.getRecordedAt() : Instant.now())
                                .imageUrl(imageUrl)
                                .notes(dto.getNotes())
                                .build();
                var saved = healthMetricRepository.save(log);
                return PatientVitalLogDto.builder()
                                .id(saved.getId())
                                .vitalType(saved.getMetricType())
                                .valueNumeric(saved.getValue())
                                .unit(saved.getUnit())
                                .recordedAt(saved.getRecordedAt())
                                .notes(saved.getNotes())
                                .imageUrl(saved.getImageUrl())
                                .build();
        }
}
