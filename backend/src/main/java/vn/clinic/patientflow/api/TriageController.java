package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.CreateTriageSessionRequest;
import vn.clinic.patientflow.api.dto.PagedResponse;
import vn.clinic.patientflow.api.dto.TriageSessionDto;
import vn.clinic.patientflow.triage.domain.TriageComplaint;
import vn.clinic.patientflow.triage.domain.TriageSession;
import vn.clinic.patientflow.triage.domain.TriageVital;
import vn.clinic.patientflow.triage.service.TriageService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Phân loại ưu tiên – tenant-scoped (X-Tenant-Id bắt buộc).
 */
@RestController
@RequestMapping(value = "/api/triage", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Triage", description = "Phân loại ưu tiên")
public class TriageController {

    private final TriageService triageService;

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo phiên phân loại (lý do khám, sinh hiệu, acuity)")
    public TriageSessionDto createSession(@Valid @RequestBody CreateTriageSessionRequest request) {
        TriageSession session = triageService.createSession(request);
        return TriageSessionDto.fromEntity(session);
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Lấy phiên phân loại theo ID")
    public TriageSessionDto getById(@PathVariable UUID id) {
        return TriageSessionDto.fromEntity(triageService.getById(id));
    }

    @GetMapping("/sessions")
    @Operation(summary = "Danh sách phiên phân loại theo chi nhánh")
    public PagedResponse<TriageSessionDto> listByBranch(
            @RequestParam UUID branchId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<TriageSession> page = triageService.listByBranch(branchId, pageable);
        return PagedResponse.of(page, page.getContent().stream().map(TriageSessionDto::fromEntity).collect(Collectors.toList()));
    }

    @GetMapping("/sessions/{id}/complaints")
    @Operation(summary = "Danh sách lý do khám / triệu chứng của phiên")
    public List<Object> getComplaints(@PathVariable UUID id) {
        return triageService.getComplaints(id).stream()
                .map(TriageController::toComplaintDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/sessions/{id}/vitals")
    @Operation(summary = "Danh sách sinh hiệu của phiên")
    public List<Object> getVitals(@PathVariable UUID id) {
        return triageService.getVitals(id).stream()
                .map(TriageController::toVitalDto)
                .collect(Collectors.toList());
    }

    private static Object toComplaintDto(TriageComplaint c) {
        return new Object() {
            public final UUID id = c.getId();
            public final String complaintType = c.getComplaintType();
            public final String complaintText = c.getComplaintText();
            public final Integer displayOrder = c.getDisplayOrder();
        };
    }

    private static Object toVitalDto(TriageVital v) {
        return new Object() {
            public final UUID id = v.getId();
            public final String vitalType = v.getVitalType();
            public final java.math.BigDecimal valueNumeric = v.getValueNumeric();
            public final String unit = v.getUnit();
            public final java.time.Instant recordedAt = v.getRecordedAt();
        };
    }
}
