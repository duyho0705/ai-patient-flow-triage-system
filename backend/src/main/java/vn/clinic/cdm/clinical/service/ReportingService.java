package vn.clinic.cdm.clinical.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import vn.clinic.cdm.clinical.repository.ClinicalConsultationRepository;
import vn.clinic.cdm.clinical.repository.DoctorRepository;
import vn.clinic.cdm.clinical.repository.PrescriptionRepository;
import vn.clinic.cdm.patient.repository.PatientRepository;

/**
 * BÃ¡o cÃ¡o thá»‘ng kÃª cho Clinic Manager (Role 3).
 */
@Service
@RequiredArgsConstructor
public class ReportingService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final ClinicalConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;

    public Map<String, Object> getClinicStats(UUID tenantId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long highRiskCount = patientRepository.countByRiskLevelIn(java.util.List.of("HIGH", "CRITICAL"));

        // Missed follow-ups (patients with no consultation in last 30 days)
        java.time.Instant cutoffDate = java.time.Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS);
        java.util.List<vn.clinic.cdm.patient.domain.Patient> missedPatients = patientRepository.findMissedFollowUps(tenantId, cutoffDate);
        
        stats.put("totalPatients", totalPatients);
        stats.put("totalDoctors", totalDoctors);
        stats.put("highRiskCount", highRiskCount);
        stats.put("missedFollowUpCount", missedPatients.size());
        stats.put("missedFollowUpPatients", missedPatients.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("fullName", p.getFullNameVi());
            m.put("condition", p.getChronicConditions());
            m.put("riskLevel", p.getRiskLevel());
            return m;
        }).limit(5).collect(java.util.stream.Collectors.toList()));

        // Disease distribution mapping
        Map<String, Long> diseaseStats = new HashMap<>();
        List<Object[]> distribution = patientRepository.getDiseaseDistribution();
        for (Object[] row : distribution) {
            String condition = (String) row[0];
            Long count = (Long) row[1];
            if (condition != null && !condition.isBlank()) {
                diseaseStats.put(condition, count);
            }
        }
        stats.put("diseaseDistribution", diseaseStats);

        return stats;
    }

    public vn.clinic.cdm.api.dto.management.MonthlyReportDto getMonthlyReport(UUID tenantId, int year, int month) {
        java.time.LocalDateTime startOfMonth = java.time.LocalDateTime.of(year, month, 1, 0, 0);
        java.time.Instant start = startOfMonth.atZone(java.time.ZoneId.systemDefault()).toInstant();
        java.time.Instant end = startOfMonth.plusMonths(1).atZone(java.time.ZoneId.systemDefault()).toInstant();

        long newPatients = patientRepository.countByTenantIdAndCreatedAtBetween(tenantId, start, end);
        long totalConsultations = consultationRepository.countByTenantIdAndStartedAtBetween(tenantId, start, end);

        @SuppressWarnings("unchecked")
        Map<String, Long> diseaseDist = (Map<String, Long>) getClinicStats(tenantId).get("diseaseDistribution");
        
        return vn.clinic.cdm.api.dto.management.MonthlyReportDto.builder()
                .year(year)
                .month(month)
                .newPatients(newPatients)
                .totalConsultations(totalConsultations)
                .retentionRate(75.5) // Mocked
                .avgSatisfaction(4.8) // Mocked
                .diseaseDistribution(diseaseDist != null ? diseaseDist : new HashMap<>())
                .build();
    }

    public List<vn.clinic.cdm.api.dto.management.DoctorPerformanceDto> getDoctorPerformance(UUID tenantId) {
        List<vn.clinic.cdm.clinical.domain.Doctor> doctors = doctorRepository.findAll();
        
        return doctors.stream().map(doc -> {
            long visits = consultationRepository.countByDoctorUserId(doc.getIdentityUser().getId());
            long prescriptions = prescriptionRepository.countByDoctor_Id(doc.getId());
            
            return vn.clinic.cdm.api.dto.management.DoctorPerformanceDto.builder()
                    .doctorId(doc.getId())
                    .fullName(doc.getIdentityUser().getFullNameVi())
                    .specialty(doc.getSpecialty())
                    .consultationCount(visits)
                    .prescriptionCount(prescriptions)
                    .avgRating(4.5 + Math.random() * 0.5)
                    .avgConsultationTime("15 mins")
                    .status(visits > 10 ? "Xuất sắc" : "Bình thường")
                    .build();
        }).collect(Collectors.toList());
    }
}

