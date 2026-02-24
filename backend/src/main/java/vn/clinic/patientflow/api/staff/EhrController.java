package vn.clinic.patientflow.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.TimelineItemDto;
import vn.clinic.patientflow.api.dto.TriageVitalDto;
import vn.clinic.patientflow.billing.repository.InvoiceRepository;
import vn.clinic.patientflow.clinical.repository.ClinicalConsultationRepository;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;
import vn.clinic.patientflow.triage.repository.TriageVitalRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ehr")
@RequiredArgsConstructor
@Tag(name = "EHR", description = "Hồ sơ sức khỏe điện tử")
public class EhrController {

    private final TriageVitalRepository vitalRepository;
    private final TriageSessionRepository triageRepository;
    private final ClinicalConsultationRepository consultationRepository;
    private final InvoiceRepository invoiceRepository;

    @GetMapping("/patient/{patientId}/vitals")
    @Operation(summary = "Lấy lịch sử dấu hiệu sinh tồn")
    public ResponseEntity<ApiResponse<List<TriageVitalDto>>> getVitalsHistory(@PathVariable UUID patientId) {
        var data = vitalRepository.findByPatientId(patientId).stream()
                .map(v -> new TriageVitalDto(v.getId(), v.getVitalType(), v.getValueNumeric(), v.getUnit(),
                        v.getRecordedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/patient/{patientId}/timeline")
    @Operation(summary = "Lấy dòng thời gian y tế của bệnh nhân")
    public ResponseEntity<ApiResponse<List<TimelineItemDto>>> getTimeline(@PathVariable UUID patientId) {
        List<TimelineItemDto> timeline = new ArrayList<>();

        // 1. Triage Sessions
        triageRepository
                .findByPatientIdOrderByStartedAtDesc(patientId, org.springframework.data.domain.PageRequest.of(0, 50))
                .forEach(s -> timeline.add(TimelineItemDto.builder()
                        .id(s.getId().toString())
                        .type("TRIAGE")
                        .timestamp(s.getStartedAt())
                        .title("Phân loại bệnh")
                        .subtitle(s.getBranch().getNameVi())
                        .content("Mức độ ưu tiên: " + s.getAcuityLevel())
                        .status("COMPLETED")
                        .build()));

        // 2. Consultations
        consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId)
                .forEach(c -> timeline.add(TimelineItemDto.builder()
                        .id(c.getId().toString())
                        .type("CONSULTATION")
                        .timestamp(c.getStartedAt())
                        .title("Khám bệnh")
                        .subtitle(c.getDoctorUser() != null ? "BS. " + c.getDoctorUser().getFullNameVi() : "Bác sĩ")
                        .content(c.getDiagnosisNotes())
                        .status(c.getStatus())
                        .build()));

        // 3. Invoices
        invoiceRepository.findAll().stream() // Ideally we should have findByPatientId in InvoiceRepository
                .filter(i -> i.getPatient() != null && i.getPatient().getId().equals(patientId))
                .forEach(i -> timeline.add(TimelineItemDto.builder()
                        .id(i.getId().toString())
                        .type("INVOICE")
                        .timestamp(i.getCreatedAt())
                        .title("Hóa đơn")
                        .subtitle("Mã: " + i.getInvoiceNumber())
                        .content("Tổng tiền: " + i.getTotalAmount().toPlainString() + " đ")
                        .status(i.getStatus())
                        .build()));

        var data = timeline.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
