package vn.clinic.patientflow.queue.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.queue.domain.QueueDefinition;
import vn.clinic.patientflow.queue.domain.QueueEntry;
import vn.clinic.patientflow.queue.repository.QueueDefinitionRepository;
import vn.clinic.patientflow.queue.repository.QueueEntryRepository;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;
import vn.clinic.patientflow.scheduling.repository.SchedulingAppointmentRepository;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.service.TenantService;
import vn.clinic.patientflow.triage.domain.TriageSession;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;

@Service
@RequiredArgsConstructor
public class QueueService {

        private final QueueDefinitionRepository queueDefinitionRepository;
        private final QueueEntryRepository queueEntryRepository;
        private final TenantService tenantService;
        private final PatientService patientService;
        private final TriageSessionRepository triageSessionRepository;
        private final SchedulingAppointmentRepository schedulingAppointmentRepository;
        private final vn.clinic.patientflow.masters.repository.MedicalServiceRepository medicalServiceRepository;
        private final QueueBroadcastService queueBroadcastService;

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
                List<QueueEntry> list = queueEntryRepository.findWaitingWithTriageByBranchAndQueue(
                                branchId, queueDefinitionId, "WAITING");
                list.sort(Comparator
                                .comparing((QueueEntry e) -> e.getTriageSession() != null
                                                ? e.getTriageSession().getAcuityLevel()
                                                : "9")
                                .thenComparing(QueueEntry::getJoinedAt));
                return list;
        }

        @Transactional
        public QueueEntry createEntry(UUID queueDefinitionId, UUID patientId, UUID triageSessionId,
                        UUID appointmentId, UUID medicalServiceId, String notes, Integer position) {
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
                vn.clinic.patientflow.masters.domain.MedicalService medicalService = medicalServiceId != null
                                ? medicalServiceRepository.findById(medicalServiceId).orElse(null)
                                : null;

                QueueEntry entry = QueueEntry.builder()
                                .tenant(tenant)
                                .branch(queueDef.getBranch())
                                .queueDefinition(queueDef)
                                .patient(patient)
                                .triageSession(triageSession)
                                .appointment(appointment)
                                .medicalService(medicalService)
                                .notes(notes)
                                .position(position != null ? position : 0)
                                .status("WAITING")
                                .joinedAt(Instant.now())
                                .build();
                QueueEntry saved = queueEntryRepository.save(entry);
                queueBroadcastService.broadcastQueueUpdate(saved.getBranch().getId());
                return saved;
        }

        @Transactional
        public QueueEntry updateEntryStatus(UUID id, String status, Instant calledAt, Instant completedAt,
                        Integer position) {
                QueueEntry entry = getEntryById(id);
                if (status != null)
                        entry.setStatus(status);
                if (calledAt != null)
                        entry.setCalledAt(calledAt);
                if (completedAt != null)
                        entry.setCompletedAt(completedAt);
                if (position != null)
                        entry.setPosition(position);
                QueueEntry saved = queueEntryRepository.save(entry);
                queueBroadcastService.broadcastQueueUpdate(saved.getBranch().getId());

                if ("CALLED".equals(status)) {
                        queueBroadcastService.notifyPatient(saved.getPatient().getId(), "Mời bạn đến quầy tiếp nhận");
                }

                return saved;
        }

        @Transactional(readOnly = true)
        public long countActiveEntriesByPatient(UUID patientId) {
                return queueEntryRepository.countByPatientIdAndStatusIn(patientId, List.of("WAITING", "CALLED"));
        }

        @Transactional(readOnly = true)
        public List<QueueEntry> getActiveEntriesByPatient(UUID patientId) {
                return queueEntryRepository.findByPatientIdAndStatusInOrderByJoinedAtDesc(patientId,
                                List.of("WAITING", "CALLED"));
        }

        @Transactional(readOnly = true)
        public long countPeopleAhead(UUID queueDefinitionId, Instant joinedAt) {
                return queueEntryRepository.countPeopleAhead(queueDefinitionId, joinedAt);
        }

        public void notifyPatient(UUID patientId, String message) {
                queueBroadcastService.notifyPatient(patientId, message);
        }

        @Transactional(readOnly = true)
        public vn.clinic.patientflow.api.dto.PublicQueueDto getPublicQueueStatus(UUID branchId) {
                var branch = tenantService.getBranchById(branchId);
                List<QueueEntry> called = queueEntryRepository.findByBranch_IdAndStatusOrderByJoinedAtAsc(branchId,
                                "CALLED");
                List<QueueEntry> waiting = queueEntryRepository.findByBranch_IdAndStatusOrderByJoinedAtAsc(branchId,
                                "WAITING");

                List<QueueEntry> nextWaiting = waiting.stream().limit(10).toList();
                // Mapping with wait time logic
                List<vn.clinic.patientflow.api.dto.QueueEntryDto> waitingDtos = new java.util.ArrayList<>();
                for (int i = 0; i < nextWaiting.size(); i++) {
                        var dto = vn.clinic.patientflow.api.dto.QueueEntryDto.fromEntity(nextWaiting.get(i));
                        dto.setPatientName(maskName(dto.getPatientName()));
                        dto.setPeopleAhead(i);
                        dto.setEstimatedWaitMinutes(i * 10); // Mock: assume 10 mins per patient
                        waitingDtos.add(dto);
                }

                return vn.clinic.patientflow.api.dto.PublicQueueDto.builder()
                                .branchName(branch.getNameVi())
                                .calledEntries(called.stream()
                                                .map(vn.clinic.patientflow.api.dto.QueueEntryDto::fromEntity)
                                                .peek(d -> d.setPatientName(maskName(d.getPatientName())))
                                                .toList())
                                .waitingEntries(waitingDtos)
                                .build();
        }

        private String maskName(String name) {
                if (name == null || name.isEmpty())
                        return "***";
                String[] parts = name.split(" ");
                if (parts.length == 0)
                        return "***";

                StringBuilder masked = new StringBuilder(parts[0]);
                for (int i = 1; i < parts.length; i++) {
                        masked.append(" *");
                }
                return masked.toString();
        }
}
