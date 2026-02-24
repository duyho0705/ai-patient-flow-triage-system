package vn.clinic.patientflow.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.queue.domain.QueueEntry;
import vn.clinic.patientflow.queue.service.QueueService;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Hàng chờ – tenant-scoped (X-Tenant-Id bắt buộc).
 */
@RestController
@RequestMapping(value = "/api/queues", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Queue", description = "Hàng chờ")
public class QueueController {

    private final QueueService queueService;

    @GetMapping("/definitions")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Danh sách định nghĩa hàng chờ theo chi nhánh")
    public ResponseEntity<ApiResponse<List<QueueDefinitionDto>>> getDefinitions(@RequestParam UUID branchId) {
        var data = queueService.getDefinitionsByBranch(branchId).stream()
                .map(QueueDefinitionDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/definitions/{queueId}/entries")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Danh sách bệnh nhân đang chờ trong hàng")
    public ResponseEntity<ApiResponse<List<QueueEntryDto>>> getWaitingEntries(
            @PathVariable UUID queueId,
            @RequestParam UUID branchId) {
        var data = queueService.getWaitingEntries(branchId, queueId).stream()
                .map(QueueEntryDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/entries/{id}")
    @Operation(summary = "Lấy bản ghi hàng chờ theo ID")
    public ResponseEntity<ApiResponse<QueueEntryDto>> getEntryById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(QueueEntryDto.fromEntity(queueService.getEntryById(id))));
    }

    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'ADMIN')")
    @Operation(summary = "Thêm bệnh nhân vào hàng chờ")
    public ResponseEntity<ApiResponse<QueueEntryDto>> createEntry(
            @RequestParam UUID queueDefinitionId,
            @RequestParam UUID patientId,
            @RequestParam Integer position,
            @RequestParam(required = false) UUID medicalServiceId,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) UUID triageSessionId,
            @RequestParam(required = false) UUID appointmentId) {
        QueueEntry entry = queueService.createEntry(
                queueDefinitionId, patientId, triageSessionId, appointmentId, medicalServiceId, notes, position);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(QueueEntryDto.fromEntity(entry)));
    }

    @PatchMapping("/entries/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Cập nhật trạng thái hàng chờ (gọi bệnh nhân, hoàn thành, v.v.)")
    public ResponseEntity<ApiResponse<QueueEntryDto>> updateEntry(@PathVariable UUID id,
            @Valid @RequestBody UpdateQueueEntryRequest request) {
        QueueEntry entry = queueService.updateEntryStatus(
                id, request.getStatus(), request.getCalledAt(), request.getCompletedAt(), request.getPosition());
        return ResponseEntity.ok(ApiResponse.success(QueueEntryDto.fromEntity(entry)));
    }

    @PatchMapping("/entries/{id}/call")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Gọi bệnh nhân vào phòng (status=CALLED, calledAt=now)")
    public ResponseEntity<ApiResponse<QueueEntryDto>> callPatient(@PathVariable UUID id) {
        QueueEntry entry = queueService.updateEntryStatus(id, "CALLED", Instant.now(), null, null);
        return ResponseEntity.ok(ApiResponse.success(QueueEntryDto.fromEntity(entry)));
    }

    @GetMapping("/public-status")
    @Operation(summary = "Lấy trạng thái hàng chờ công khai cho TV")
    public ResponseEntity<ApiResponse<PublicQueueDto>> getPublicStatus(@RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(queueService.getPublicQueueStatus(branchId)));
    }
}
