package vn.clinic.cdm.service.patient;

import org.springframework.web.multipart.MultipartFile;
import vn.clinic.cdm.dto.clinical.ConsultationDetailDto;
import vn.clinic.cdm.dto.clinical.ConsultationDto;
import vn.clinic.cdm.dto.clinical.VitalTrendDto;
import vn.clinic.cdm.dto.common.PagedResponse;
import vn.clinic.cdm.dto.medication.MedicationDosageLogDto;
import vn.clinic.cdm.dto.patient.*;
import vn.clinic.cdm.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.dto.scheduling.CreateAppointmentRequest;
import vn.clinic.cdm.entity.patient.Patient;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface PatientPortalService {
    Patient getAuthenticatedPatient();
    PatientDashboardDto getDashboardData(Patient p);
    PatientVitalLogDto logVitalMetric(Patient p, PatientVitalLogDto dto);
    MedicationDosageLogDto markMedicationTaken(Patient p, MedicationDosageLogDto dto);
    PatientDto updateProfile(UUID patientId, UpdatePatientProfileRequest request);
    PatientDto uploadAvatar(UUID patientId, MultipartFile file);
    AppointmentDto createAppointment(Patient p, CreateAppointmentRequest request);
    AppointmentDto cancelAppointment(UUID patientId, UUID appointmentId);
    PagedResponse<ConsultationDto> getMedicalHistory(UUID patientId, int page, int size);
    ConsultationDetailDto getConsultationDetail(UUID patientId, UUID consultationId);
    List<VitalTrendDto> getVitalTrends(UUID patientId, String type);
    List<VitalTrendDto> getVitalTrendsFiltered(UUID patientId, String type, Instant from, Instant to);
    PatientVitalLogDto logVitalWithImage(Patient p, PatientVitalLogDto dto, MultipartFile image);
}
