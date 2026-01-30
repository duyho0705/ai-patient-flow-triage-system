package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.QueueDefinitionDto;
import vn.clinic.patientflow.api.dto.QueueEntryDto;
import vn.clinic.patientflow.api.dto.UpdateQueueEntryRequest;
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
    @Operation(summary = "Danh sách định nghĩa hàng chờ theo chi nhánh")
    public List<QueueDefinitionDto> getDefinitions(@RequestParam UUID branchId) {
        return queueService.getDefinitionsByBranch(branchId).stream()
                .map(QueueDefinitionDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/definitions/{queueId}/entries")
    @Operation(summary = "Danh sách bệnh nhân đang chờ trong hàng")
    public List<QueueEntryDto> getWaitingEntries(
            @PathVariable UUID queueId,
            @RequestParam UUID branchId) {
        return queueService.getWaitingEntries(branchId, queueId).stream()
                .map(QueueEntryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/entries/{id}")
    @Operation(summary = "Lấy bản ghi hàng chờ theo ID")
    public QueueEntryDto getEntryById(@PathVariable UUID id) {
        return QueueEntryDto.fromEntity(queueService.getEntryById(id));
    }

    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Thêm bệnh nhân vào hàng chờ")
    public QueueEntryDto createEntry(
            @RequestParam UUID queueDefinitionId,
            @RequestParam UUID patientId,
            @RequestParam Integer position,
            @RequestParam(required = false) UUID triageSessionId,
            @RequestParam(required = false) UUID appointmentId) {
        QueueEntry entry = queueService.createEntry(
                queueDefinitionId, patientId, triageSessionId, appointmentId, position);
        return QueueEntryDto.fromEntity(entry);
    }

    @PatchMapping("/entries/{id}")
    @Operation(summary = "Cập nhật trạng thái hàng chờ (gọi bệnh nhân, hoàn thành, v.v.)")
    public QueueEntryDto updateEntry(@PathVariable UUID id, @Valid @RequestBody UpdateQueueEntryRequest request) {
        QueueEntry entry = queueService.updateEntryStatus(
                id, request.getStatus(), request.getCalledAt(), request.getCompletedAt(), request.getPosition());
        return QueueEntryDto.fromEntity(entry);
    }

    @PatchMapping("/entries/{id}/call")
    @Operation(summary = "Gọi bệnh nhân vào phòng (status=CALLED, calledAt=now)")
    public QueueEntryDto callPatient(@PathVariable UUID id) {
        QueueEntry entry = queueService.updateEntryStatus(id, "CALLED", Instant.now(), null, null);
        return QueueEntryDto.fromEntity(entry);
    }
}
