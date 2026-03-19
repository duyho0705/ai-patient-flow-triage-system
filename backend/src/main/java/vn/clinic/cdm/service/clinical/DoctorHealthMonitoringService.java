package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.clinical.HealthMetricDto;
import vn.clinic.cdm.dto.clinical.VitalTrendDto;
import vn.clinic.cdm.dto.clinical.HealthThresholdDto;
import vn.clinic.cdm.dto.clinical.UpdateHealthThresholdRequest;

import java.util.List;
import java.util.UUID;

public interface DoctorHealthMonitoringService {
    List<HealthMetricDto> getPatientHealthMetrics(UUID patientId);
    List<VitalTrendDto> getPatientHealthTrends(UUID patientId, String type, int days);
    List<HealthThresholdDto> getPatientThresholds(UUID patientId);
    HealthThresholdDto upsertThreshold(UUID patientId, UpdateHealthThresholdRequest request);
}