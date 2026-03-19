package vn.clinic.cdm.service.clinical.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.dto.clinical.HealthMetricDto;
import vn.clinic.cdm.dto.clinical.HealthThresholdDto;
import vn.clinic.cdm.dto.clinical.UpdateHealthThresholdRequest;
import vn.clinic.cdm.dto.clinical.VitalTrendDto;
import vn.clinic.cdm.entity.clinical.HealthThreshold;
import vn.clinic.cdm.repository.clinical.HealthMetricRepository;
import vn.clinic.cdm.repository.clinical.HealthThresholdRepository;
import vn.clinic.cdm.entity.patient.Patient;
import vn.clinic.cdm.service.patient.PatientService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service theo dõi chỉ số sức khỏe bệnh nhân — dành cho Doctor Portal.
 * <p>
 * Hỗ trợ:
 * - Xem tất cả chỉ số sức khỏe gần nhất
 * - Xem xu hướng chỉ số theo loại (biểu đồ)
 * - Cài đặt ngưỡng cảnh báo cá nhân hóa cho từng bệnh nhân
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorHealthMonitoringServiceImpl implements vn.clinic.cdm.service.clinical.DoctorHealthMonitoringService {

    private final HealthMetricRepository healthMetricRepository;
    private final HealthThresholdRepository healthThresholdRepository;
    private final PatientService patientService;

    /**
     * Lấy tất cả chỉ số sức khỏe gần nhất của bệnh nhân (giới hạn 50 bản ghi).
     */
    @Transactional(readOnly = true)
    public List<HealthMetricDto> getPatientHealthMetrics(UUID patientId) {
        // Validate bệnh nhân tồn tại
        patientService.getById(patientId);

        return healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .stream()
                .limit(50)
                .map(HealthMetricDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy xu hướng chỉ số theo loại và khoảng thời gian.
     *
     * @param patientId  ID bệnh nhân
     * @param metricType BLOOD_GLUCOSE, BLOOD_PRESSURE_SYS, BLOOD_PRESSURE_DIA,
     *                   SPO2, HEART_RATE, WEIGHT
     * @param daysBack   Số ngày lùi lại (mặc định 30)
     */
    @Transactional(readOnly = true)
    public List<VitalTrendDto> getPatientHealthTrends(UUID patientId, String metricType, int daysBack) {
        patientService.getById(patientId);

        Instant from = Instant.now().minus(daysBack, ChronoUnit.DAYS);
        Instant to = Instant.now();

        return healthMetricRepository
                .findByPatientIdAndMetricTypeAndRecordedAtBetweenOrderByRecordedAtAsc(
                        patientId, metricType, from, to)
                .stream()
                .map(m -> VitalTrendDto.builder()
                        .recordedAt(m.getRecordedAt())
                        .type(m.getMetricType())
                        .value(m.getValue())
                        .unit(m.getUnit())
                        .status(m.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách ngưỡng cảnh báo cá nhân hóa cho bệnh nhân.
     */
    @Transactional(readOnly = true)
    public List<HealthThresholdDto> getPatientThresholds(UUID patientId) {
        patientService.getById(patientId);

        return healthThresholdRepository.findByPatientId(patientId)
                .stream()
                .map(HealthThresholdDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật hoặc tạo ngưỡng cảnh báo cá nhân hóa (upsert theo metricType).
     */
    @Transactional
    public HealthThresholdDto upsertThreshold(UUID patientId, UpdateHealthThresholdRequest request) {
        Patient patient = patientService.getById(patientId);

        HealthThreshold threshold = healthThresholdRepository
                .findByPatientIdAndMetricType(patientId, request.getMetricType())
                .orElseGet(() -> HealthThreshold.builder()
                        .patient(patient)
                        .metricType(request.getMetricType())
                        .build());

        threshold.setMinValue(request.getMinValue());
        threshold.setMaxValue(request.getMaxValue());

        HealthThreshold saved = healthThresholdRepository.save(threshold);
        log.info("Upserted health threshold for patient={}, type={}, min={}, max={}",
                patientId, request.getMetricType(), request.getMinValue(), request.getMaxValue());

        return HealthThresholdDto.fromEntity(saved);
    }
}
