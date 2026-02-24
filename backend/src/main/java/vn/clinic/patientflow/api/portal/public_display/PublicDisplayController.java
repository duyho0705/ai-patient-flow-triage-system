package vn.clinic.patientflow.api.portal.public_display;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.PublicDisplayDto;
import vn.clinic.patientflow.queue.domain.QueueEntry;
import vn.clinic.patientflow.queue.repository.QueueEntryRepository;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.repository.TenantBranchRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/display")
@RequiredArgsConstructor
@Tag(name = "Public Display", description = "Endpoints cho màn hình TV công cộng")
public class PublicDisplayController {

    private final QueueEntryRepository queueEntryRepository;
    private final TenantBranchRepository branchRepository;

    @GetMapping("/{branchId}")
    @Operation(summary = "Lấy dữ liệu hiển thị cho màn hình Smart TV")
    public ResponseEntity<ApiResponse<PublicDisplayDto>> getDisplayData(@PathVariable UUID branchId) {
        TenantBranch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        List<QueueEntry> allEntries = queueEntryRepository.findByBranchId(branchId);

        List<PublicDisplayDto.DisplayEntryDto> calling = allEntries.stream()
                .filter(e -> "CALLED".equalsIgnoreCase(e.getStatus()))
                .map(this::mapToDisplayDto)
                .collect(Collectors.toList());

        List<PublicDisplayDto.DisplayEntryDto> waiting = allEntries.stream()
                .filter(e -> "WAITING".equalsIgnoreCase(e.getStatus()))
                .limit(10)
                .map(this::mapToDisplayDto)
                .collect(Collectors.toList());

        var data = PublicDisplayDto.builder()
                .branchName(branch.getNameVi())
                .calling(calling)
                .waiting(waiting)
                .build();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    private PublicDisplayDto.DisplayEntryDto mapToDisplayDto(QueueEntry e) {
        return PublicDisplayDto.DisplayEntryDto.builder()
                .patientName(maskName(e.getPatient().getFullNameVi()))
                .queueName(e.getQueueDefinition().getNameVi())
                .status(e.getStatus())
                .acuityLevel(e.getAcuityLevel())
                .build();
    }

    private String maskName(String fullName) {
        if (fullName == null || fullName.isEmpty())
            return "***";
        String[] parts = fullName.split(" ");
        if (parts.length < 2)
            return fullName;

        StringBuilder masked = new StringBuilder(parts[0]);
        for (int i = 1; i < parts.length - 1; i++) {
            masked.append(" *");
        }
        masked.append(" ").append(parts[parts.length - 1]);
        return masked.toString();
    }
}
