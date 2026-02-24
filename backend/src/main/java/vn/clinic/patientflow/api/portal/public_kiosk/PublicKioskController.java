package vn.clinic.patientflow.api.portal.public_kiosk;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.KioskRegistrationRequest;
import vn.clinic.patientflow.api.dto.QueueDefinitionDto;
import vn.clinic.patientflow.api.dto.QueueEntryDto;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.repository.PatientRepository;
import vn.clinic.patientflow.queue.domain.QueueEntry;
import vn.clinic.patientflow.queue.repository.QueueDefinitionRepository;
import vn.clinic.patientflow.queue.service.QueueService;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.repository.TenantBranchRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/kiosk")
@RequiredArgsConstructor
@Tag(name = "Public Kiosk", description = "Endpoints cho máy Kiosk tự phục vụ")
public class PublicKioskController {

    private final PatientRepository patientRepository;
    private final TenantBranchRepository branchRepository;
    private final QueueService queueService;
    private final QueueDefinitionRepository queueDefinitionRepository;

    @GetMapping("/queues")
    @Operation(summary = "Lấy danh sách hàng chờ công khai cho Kiosk")
    public ResponseEntity<ApiResponse<List<QueueDefinitionDto>>> getPublicQueues(@RequestParam UUID branchId) {
        var data = queueDefinitionRepository
                .findByBranchIdAndIsActiveTrueOrderByDisplayOrderAsc(branchId).stream()
                .map(QueueDefinitionDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/register")
    @Operation(summary = "Bệnh nhân tự đăng ký và lấy số thứ tự tại Kiosk")
    public ResponseEntity<ApiResponse<QueueEntryDto>> register(@RequestBody KioskRegistrationRequest request) {
        TenantBranch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        // 1. Find or create patient
        Patient patient = patientRepository
                .findByTenantIdAndPhone(branch.getTenant().getId(), request.getPhone())
                .orElseGet(() -> {
                    Patient newPatient = Patient.builder()
                            .tenant(branch.getTenant())
                            .fullNameVi(request.getFullName())
                            .phone(request.getPhone())
                            .dateOfBirth(request.getDateOfBirth())
                            .isActive(true)
                            .build();
                    return patientRepository.save(newPatient);
                });

        try {
            TenantContext.setTenantId(branch.getTenant().getId());
            // 2. Join queue
            QueueEntry entry = queueService.createEntry(
                    request.getQueueDefinitionId(),
                    patient.getId(),
                    (UUID) null,
                    request.getAppointmentId(),
                    (UUID) null,
                    request.getPhone(), // use phone as notes or identifier
                    0 // position
            );
            return ResponseEntity.ok(ApiResponse.success(QueueEntryDto.fromEntity(entry)));
        } finally {
            TenantContext.clear();
        }
    }
}
