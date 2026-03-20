package vn.clinic.cdm.service.patient.impl;

import vn.clinic.cdm.common.tenant.TenantContext;

import vn.clinic.cdm.dto.patient.PatientDashboardDto;
import vn.clinic.cdm.dto.patient.PatientVitalLogDto;
import vn.clinic.cdm.dto.patient.PatientDto;
import vn.clinic.cdm.dto.patient.UpdatePatientProfileRequest;
import vn.clinic.cdm.dto.patient.UpdatePatientRequest;
import vn.clinic.cdm.dto.clinical.ConsultationDto;
import vn.clinic.cdm.dto.clinical.ConsultationDetailDto;
import vn.clinic.cdm.dto.clinical.VitalTrendDto;
import vn.clinic.cdm.dto.clinical.TriageVitalDto;
import vn.clinic.cdm.dto.clinical.LabResultDto;
import vn.clinic.cdm.dto.clinical.DiagnosticImageDto;
import vn.clinic.cdm.dto.medication.MedicationDosageLogDto;
import vn.clinic.cdm.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.dto.scheduling.CreateAppointmentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import vn.clinic.cdm.security.AuthPrincipal;

import vn.clinic.cdm.repository.clinical.DiagnosticImageRepository;
import vn.clinic.cdm.repository.clinical.LabResultRepository;
import vn.clinic.cdm.service.clinical.ClinicalService;
import vn.clinic.cdm.dto.common.PagedResponse;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.cdm.service.common.FileStorageService;
import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.service.identity.IdentityService;
import vn.clinic.cdm.entity.patient.Patient;
import vn.clinic.cdm.entity.scheduling.SchedulingAppointment;
import vn.clinic.cdm.service.scheduling.SchedulingService;
import vn.clinic.cdm.entity.tenant.TenantBranch;
import vn.clinic.cdm.repository.clinical.HealthMetricRepository;
import vn.clinic.cdm.service.clinical.MedicationService;
import vn.clinic.cdm.entity.clinical.HealthMetric;
import vn.clinic.cdm.entity.clinical.VitalSignsThresholds;
import vn.clinic.cdm.mapper.MedicationMapper;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import vn.clinic.cdm.service.patient.PatientPortalService;
import vn.clinic.cdm.service.patient.PatientService;

/**
 * Orchestration Service for Chronic Disease Management (CDM) Patient Portal.
 */
@Service("patientPortalService")
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PatientPortalServiceImpl implements PatientPortalService {
        private final MedicationMapper medicationMapper;
        private final PatientService patientService;
        private final SchedulingService schedulingService;
        private final ClinicalService clinicalService;
        private final IdentityService identityService;
        private final MedicationService medicationService;
        private final FileStorageService fileStorageService;
        private final vn.clinic.cdm.repository.clinical.PrescriptionRepository prescriptionRepository;
        private final LabResultRepository labResultRepository;
        private final DiagnosticImageRepository diagnosticImageRepository;
        private final HealthMetricRepository healthMetricRepository;

        public Patient getAuthenticatedPatient() {
                UUID userId = AuthPrincipal.getCurrentUserId();
                Patient p = patientService.getByUserId(userId);
                if (TenantContext.getTenantId().isEmpty()) {
                        TenantContext.setTenantId(p.getTenant().getId());
                }
                return p;
        }

        public PatientDashboardDto getDashboardData(Patient p) {
                UUID patientId = p.getId();
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

                        TriageVitalDto latest = sorted.get(0);
                        if (VitalSignsThresholds.isAbnormal(type, latest.valueNumeric())) {
                                if (sorted.size() >= 3 &&
                                                VitalSignsThresholds.isAbnormal(type, sorted.get(1).valueNumeric()) &&
                                                VitalSignsThresholds.isAbnormal(type, sorted.get(2).valueNumeric())) {
                                        alerts.add(String.format(
                                                        "Cảnh báo: Chỉ số %s bất thường liên tiếp trong 3 lượt đo gần nhất.",
                                                        VitalSignsThresholds.getLabel(type)));
                                } else {
                                        alerts.add(String.format("Lưu ý: Chỉ số %s hiện tại đang ở mức bất thường.",
                                                        VitalSignsThresholds.getLabel(type)));
                                }
                        }
                }
                return alerts;
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
                                .tenant(p.getTenant())
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
                                        "Ghi nhận bởi bệnh nhân");
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

                UpdatePatientRequest updates = UpdatePatientRequest.builder()
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
                Patient p = patientService.getById(patientId);
                p.setAvatarUrl(url);
                return PatientDto.fromEntity(patientService.save(p));
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
                                .tenant(p.getTenant())
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
