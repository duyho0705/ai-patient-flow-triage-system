package vn.clinic.cdm.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.clinical.repository.ClinicalConsultationRepository;
import vn.clinic.cdm.scheduling.repository.SchedulingAppointmentRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Analytics Service for CDM.
 * Provides consultation and appointment-based metrics instead of triage/queue.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

        private final ClinicalConsultationRepository consultationRepository;
        private final SchedulingAppointmentRepository appointmentRepository;

        public Map<String, Object> getTodaySummary(UUID tenantId, UUID branchId) {
                LocalDate today = LocalDate.now();
                Instant startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant endOfDay = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

                long consultationCount = consultationRepository.countByTenantIdAndStartedAtBetween(tenantId, startOfDay,
                                endOfDay);
                long appointmentCount = appointmentRepository.countByTenantIdAndAppointmentDate(tenantId, today);

                Map<String, Object> result = new HashMap<>();
                result.put("consultationCount", consultationCount);
                result.put("appointmentCount", appointmentCount);
                result.put("date", today.toString());
                return result;
        }

        public Map<String, Object> getWeekSummary(UUID tenantId, UUID branchId) {
                LocalDate today = LocalDate.now();
                Instant startOfWeek = today.minusDays(6).atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant endOfWeek = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

                long consultationCount = consultationRepository.countByTenantIdAndStartedAtBetween(tenantId,
                                startOfWeek, endOfWeek);

                Map<String, Object> result = new HashMap<>();
                result.put("consultationCount", consultationCount);
                result.put("periodDays", 7);
                result.put("avgPerDay", Math.round((double) consultationCount / 7.0 * 10) / 10.0);
                return result;
        }
}

