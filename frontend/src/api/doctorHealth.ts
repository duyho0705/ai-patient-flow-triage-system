import { get, put, type TenantHeaders } from './client'
import type {
    HealthMetricDto,
    HealthThresholdDto,
    UpdateHealthThresholdRequest,
    VitalTrendDto
} from '@/types/api'

// ═══════════════════════════════════════════════════
//  Theo dõi Sức khỏe Bệnh nhân — Doctor Portal
// ═══════════════════════════════════════════════════

/**
 * Lấy tất cả chỉ số sức khỏe gần nhất của bệnh nhân.
 *
 * @returns Danh sách chỉ số (giới hạn 50 gần nhất, sắp xếp mới nhất trước)
 */
export async function getPatientHealthMetrics(
    patientId: string,
    headers: TenantHeaders | null
): Promise<HealthMetricDto[]> {
    return get<HealthMetricDto[]>(
        `/doctor-portal/patients/${patientId}/health/metrics`,
        headers
    )
}

/**
 * Lấy xu hướng chỉ số theo loại — dùng cho biểu đồ (chart).
 *
 * @param type   Loại chỉ số: BLOOD_GLUCOSE | BLOOD_PRESSURE_SYS | BLOOD_PRESSURE_DIA |
 *               SPO2 | HEART_RATE | WEIGHT
 * @param days   Số ngày lùi lại (mặc định 30)
 */
export async function getPatientHealthTrends(
    patientId: string,
    type: string,
    headers: TenantHeaders | null,
    days = 30
): Promise<VitalTrendDto[]> {
    return get<VitalTrendDto[]>(
        `/doctor-portal/patients/${patientId}/health/metrics/trends?type=${type}&days=${days}`,
        headers
    )
}

/**
 * Lấy danh sách ngưỡng cảnh báo cá nhân hóa của bệnh nhân.
 */
export async function getPatientHealthThresholds(
    patientId: string,
    headers: TenantHeaders | null
): Promise<HealthThresholdDto[]> {
    return get<HealthThresholdDto[]>(
        `/doctor-portal/patients/${patientId}/health/thresholds`,
        headers
    )
}

/**
 * Cập nhật hoặc tạo ngưỡng cảnh báo cá nhân hóa (upsert theo metricType).
 *
 * @example
 * ```ts
 * await upsertPatientHealthThreshold('patient-uuid', {
 *   metricType: 'BLOOD_GLUCOSE',
 *   minValue: 70,
 *   maxValue: 180
 * }, tenant)
 * ```
 */
export async function upsertPatientHealthThreshold(
    patientId: string,
    data: UpdateHealthThresholdRequest,
    headers: TenantHeaders | null
): Promise<HealthThresholdDto> {
    return put<HealthThresholdDto>(
        `/doctor-portal/patients/${patientId}/health/thresholds`,
        data,
        headers
    )
}

// ═══════════════════════════════════════════════════
//  Helper: Metric Type Labels (tiếng Việt)
// ═══════════════════════════════════════════════════

export const METRIC_TYPE_LABELS: Record<string, string> = {
    BLOOD_GLUCOSE: 'Đường huyết',
    BLOOD_PRESSURE_SYS: 'Huyết áp tâm thu',
    BLOOD_PRESSURE_DIA: 'Huyết áp tâm trương',
    SPO2: 'SpO2',
    HEART_RATE: 'Nhịp tim',
    WEIGHT: 'Cân nặng',
    TEMPERATURE: 'Nhiệt độ',
    BMI: 'BMI',
}

export const METRIC_TYPE_UNITS: Record<string, string> = {
    BLOOD_GLUCOSE: 'mg/dL',
    BLOOD_PRESSURE_SYS: 'mmHg',
    BLOOD_PRESSURE_DIA: 'mmHg',
    SPO2: '%',
    HEART_RATE: 'bpm',
    WEIGHT: 'kg',
    TEMPERATURE: '°C',
    BMI: 'kg/m²',
}

export const METRIC_TYPE_COLORS: Record<string, string> = {
    BLOOD_GLUCOSE: '#f59e0b',
    BLOOD_PRESSURE_SYS: '#ef4444',
    BLOOD_PRESSURE_DIA: '#ec4899',
    SPO2: '#3b82f6',
    HEART_RATE: '#10b981',
    WEIGHT: '#8b5cf6',
    TEMPERATURE: '#f97316',
    BMI: '#6366f1',
}
