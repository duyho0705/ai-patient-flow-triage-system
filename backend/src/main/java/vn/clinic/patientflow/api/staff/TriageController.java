package vn.clinic.patientflow.api.staff;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.CreateTriageSessionRequest;
import vn.clinic.patientflow.api.dto.PagedResponse;
import vn.clinic.patientflow.api.dto.SuggestAcuityRequest;
import vn.clinic.patientflow.api.dto.TriageComplaintDto;
import vn.clinic.patientflow.api.dto.TriageSessionDto;
import vn.clinic.patientflow.api.dto.TriageSuggestionDto;
import vn.clinic.patientflow.api.dto.TriageVitalDto;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.triage.ai.AiTriageService;
import vn.clinic.patientflow.triage.domain.TriageComplaint;
import vn.clinic.patientflow.triage.domain.TriageSession;
import vn.clinic.patientflow.triage.domain.TriageVital;
import vn.clinic.patientflow.triage.service.TriageService;

/**
 * Phân loại ưu tiên – tenant-scoped (X-Tenant-Id bắt buộc).
 */
@RestController
@RequestMapping(value = "/api/triage", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Triage", description = "Phân loại ưu tiên")
public class TriageController {

    private final TriageService triageService;
    private final AiTriageService aiTriageService;
    private final PatientService patientService;

    @PostMapping("/suggest")
    @PreAuthorize("hasAnyRole('TRIAGE_NURSE', 'ADMIN')")
    @Operation(summary = "Gợi ý mức độ ưu tiên (AI/rule). Không tạo session; dùng trước khi POST /sessions với useAiSuggestion=true hoặc để hiển thị gợi ý.")
    public ResponseEntity<ApiResponse<TriageSuggestionDto>> suggest(@Valid @RequestBody SuggestAcuityRequest request) {
        AiTriageService.TriageInput input = buildTriageInput(request);
        AiTriageService.TriageSuggestionResult result = aiTriageService.suggest(input);
        var data = TriageSuggestionDto.builder()
                .suggestedAcuity(result.getSuggestedAcuity())
                .confidence(result.getConfidence())
                .latencyMs(result.getLatencyMs())
                .providerKey(result.getProviderKey())
                .explanation(result.getExplanation())
                .build();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    private AiTriageService.TriageInput buildTriageInput(SuggestAcuityRequest request) {
        int ageInYears = request.getAgeInYears() != null ? request.getAgeInYears() : 0;
        if (request.getPatientId() != null) {
            Patient p = patientService.getById(request.getPatientId());
            if (p.getDateOfBirth() != null) {
                ageInYears = (int) ChronoUnit.YEARS.between(p.getDateOfBirth(), LocalDate.now());
            }
        }
        Map<String, BigDecimal> vitals = new HashMap<>();
        if (request.getVitals() != null) {
            for (var v : request.getVitals()) {
                if (v.getVitalType() != null && v.getValueNumeric() != null) {
                    vitals.put(v.getVitalType(), v.getValueNumeric());
                }
            }
        }
        List<String> complaintTypes = request.getComplaintTypes() != null ? request.getComplaintTypes() : List.of();
        return AiTriageService.TriageInput.builder()
                .chiefComplaintText(request.getChiefComplaintText())
                .ageInYears(ageInYears)
                .vitals(vitals)
                .complaintTypes(complaintTypes)
                .build();
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('TRIAGE_NURSE', 'ADMIN')")
    @Operation(summary = "Tạo phiên phân loại (lý do khám, sinh hiệu, acuity)")
    public ResponseEntity<ApiResponse<TriageSessionDto>> createSession(
            @Valid @RequestBody CreateTriageSessionRequest request) {
        TriageSession session = triageService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(TriageSessionDto.fromEntity(session)));
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Lấy phiên phân loại theo ID")
    public ResponseEntity<ApiResponse<TriageSessionDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(TriageSessionDto.fromEntity(triageService.getById(id))));
    }

    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('TRIAGE_NURSE', 'ADMIN', 'CLINIC_MANAGER', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Danh sách phiên phân loại theo chi nhánh")
    public ResponseEntity<ApiResponse<PagedResponse<TriageSessionDto>>> listByBranch(
            @RequestParam UUID branchId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<TriageSession> page = triageService.listByBranch(branchId, pageable);
        var paged = PagedResponse.of(page,
                page.getContent().stream().map(TriageSessionDto::fromEntity).collect(Collectors.toList()));
        return ResponseEntity.ok(ApiResponse.success(paged));
    }

    @GetMapping("/sessions/{id}/complaints")
    @Operation(summary = "Danh sách lý do khám / triệu chứng của phiên")
    public ResponseEntity<ApiResponse<List<TriageComplaintDto>>> getComplaints(@PathVariable UUID id) {
        var data = triageService.getComplaints(id).stream()
                .map(TriageController::toComplaintDto) 
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/sessions/{id}/vitals")
    @Operation(summary = "Danh sách sinh hiệu của phiên")
    public ResponseEntity<ApiResponse<List<TriageVitalDto>>> getVitals(@PathVariable UUID id) {
        var data = triageService.getVitals(id).stream()
                .map(TriageController::toVitalDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    private static TriageComplaintDto toComplaintDto(TriageComplaint c) {
        return new TriageComplaintDto(
                c.getId(),
                c.getComplaintType(),
                c.getComplaintText(),
                c.getDisplayOrder());
    }

    private static TriageVitalDto toVitalDto(TriageVital v) {
        return new TriageVitalDto(
                v.getId(),
                v.getVitalType(),
                v.getValueNumeric(),
                v.getUnit(),
                v.getRecordedAt());
    }
}
