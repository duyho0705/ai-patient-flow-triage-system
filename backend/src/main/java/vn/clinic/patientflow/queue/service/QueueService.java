package vn.clinic.patientflow.queue.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.queue.domain.QueueDefinition;
import vn.clinic.patientflow.queue.domain.QueueEntry;
import vn.clinic.patientflow.queue.repository.QueueDefinitionRepository;
import vn.clinic.patientflow.queue.repository.QueueEntryRepository;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.service.TenantService;
import vn.clinic.patientflow.triage.domain.TriageSession;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;
import vn.clinic.patientflow.scheduling.repository.SchedulingAppointmentRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueDefinitionRepository queueDefinitionRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final TenantService tenantService;
    private final PatientService patientService;
    private final TriageSessionRepository triageSessionRepository;
    private final SchedulingAppointmentRepository schedulingAppointmentRepository;

    @Transactional(readOnly = true)
    public List<QueueDefinition> getDefinitionsByBranch(UUID branchId) {
        return queueDefinitionRepository.findByBranchIdAndIsActiveTrueOrderByDisplayOrderAsc(branchId);
    }

    @Transactional(readOnly = true)
    public QueueEntry getEntryById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return queueEntryRepository.findById(id)
                .filter(e -> e.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("QueueEntry", id));
    }

    @Transactional(readOnly = true)
    public List<QueueEntry> getWaitingEntries(UUID branchId, UUID queueDefinitionId) {
        return queueEntryRepository.findByBranchIdAndQueueDefinitionIdAndStatusOrderByPositionAsc(
                branchId, queueDefinitionId, "WAITING");
    }

    @Transactional
    public QueueEntry createEntry(UUID queueDefinitionId, UUID patientId, UUID triageSessionId,
                                  UUID appointmentId, int position) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        Tenant tenant = tenantService.getById(tenantId);
        QueueDefinition queueDef = queueDefinitionRepository.findById(queueDefinitionId)
                .orElseThrow(() -> new ResourceNotFoundException("QueueDefinition", queueDefinitionId));
        if (!queueDef.getBranch().getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Queue does not belong to current tenant");
        }
        Patient patient = patientService.getById(patientId);
        TriageSession triageSession = triageSessionId != null
                ? triageSessionRepository.findById(triageSessionId).orElse(null)
                : null;
        SchedulingAppointment appointment = appointmentId != null
                ? schedulingAppointmentRepository.findById(appointmentId).orElse(null)
                : null;

        QueueEntry entry = QueueEntry.builder()
                .tenant(tenant)
                .branch(queueDef.getBranch())
                .queueDefinition(queueDef)
                .patient(patient)
                .triageSession(triageSession)
                .appointment(appointment)
                .position(position)
                .status("WAITING")
                .joinedAt(Instant.now())
                .build();
        return queueEntryRepository.save(entry);
    }

    @Transactional
    public QueueEntry updateEntryStatus(UUID id, String status, Instant calledAt, Instant completedAt, Integer position) {
        QueueEntry entry = getEntryById(id);
        if (status != null) entry.setStatus(status);
        if (calledAt != null) entry.setCalledAt(calledAt);
        if (completedAt != null) entry.setCompletedAt(completedAt);
        if (position != null) entry.setPosition(position);
        return queueEntryRepository.save(entry);
    }
}
