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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

        return PatientDashboardDto.builder()
                .patientName(p.getFullNameVi())
                .activeQueues(queueService.countActiveEntriesByPatient(p.getId()))
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
                    dto.setPeopleAhead(
                            (int) queueService.countPeopleAhead(e.getQueueDefinition().getId(), e.getJoinedAt()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private Patient getAuthenticatedPatient() {
        UUID userId = AuthPrincipal.getCurrentUserId();
        return patientService.getByIdentityUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient record not found for this user. Please link your profile in settings."));
    }
}
