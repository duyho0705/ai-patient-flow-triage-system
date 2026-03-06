import { get, post, put, patch, type TenantHeaders } from './client'
import type {
    AppointmentDto,
    PatientDto,
    PagedResponse,
    PrescriptionDto,
    UpdatePrescriptionRequest
} from '@/types/api'

// ═══════════════════════════════════════════════════
//  Risk Patient DTO (backend: ClinicalRiskService)
// ═══════════════════════════════════════════════════

export interface RiskPatientDto {
    id: string;
    patientId: string;
    patientName: string;
    patientAvatar?: string;
    fullNameVi?: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
    lastVitalTrend?: string;
}

export interface DoctorDashboardDto {
    totalPatientsToday: number;
    pendingConsultations: number;
    completedConsultationsToday: number;
    upcomingAppointments: AppointmentDto[];
    unreadMessages: any[];
    riskPatients: RiskPatientDto[];
    criticalVitalsAlerts: string[];
}

// ═══════════════════════════════════════════════════
//  Dashboard
// ═══════════════════════════════════════════════════

export async function getDoctorDashboard(headers: TenantHeaders | null): Promise<DoctorDashboardDto> {
    return get<DoctorDashboardDto>('/doctor-portal/dashboard', headers)
}

// ═══════════════════════════════════════════════════
//  Quản lý Bệnh nhân
// ═══════════════════════════════════════════════════

/** Danh sách bệnh nhân (phân trang) — Doctor Portal */
export async function getDoctorPatientList(
    headers: TenantHeaders | null,
    page = 0,
    size = 20
): Promise<PagedResponse<PatientDto>> {
    return get<PagedResponse<PatientDto>>(
        `/doctor-portal/patients?page=${page}&size=${size}`,
        headers
    )
}

/** Danh sách bệnh nhân (staff endpoint — backward compatible) */
export async function getDoctorPatients(
    headers: TenantHeaders | null,
    page = 0,
    size = 20
): Promise<PagedResponse<PatientDto>> {
    return get<PagedResponse<PatientDto>>(
        `/patients?page=${page}&size=${size}`,
        headers
    )
}

/** Hồ sơ đầy đủ bệnh nhân */
export async function getPatientFullProfile(
    patientId: string,
    headers: TenantHeaders | null
): Promise<PatientDto> {
    return get<PatientDto>(
        `/doctor-portal/patients/${patientId}/full-profile`,
        headers
    )
}

/** Tóm tắt lâm sàng AI */
export async function getPatientClinicalSummary(
    patientId: string,
    headers: TenantHeaders | null
): Promise<string> {
    return get<string>(
        `/doctor-portal/patients/${patientId}/clinical-summary`,
        headers
    )
}

// ═══════════════════════════════════════════════════
//  Quản lý Đơn thuốc Điện tử
// ═══════════════════════════════════════════════════

/** Danh sách đơn thuốc do bác sĩ kê (phân trang) */
export async function getDoctorPrescriptions(
    headers: TenantHeaders | null,
    page = 0,
    size = 20
): Promise<PagedResponse<PrescriptionDto>> {
    return get<PagedResponse<PrescriptionDto>>(
        `/doctor-portal/prescriptions?page=${page}&size=${size}`,
        headers
    )
}

/** Chi tiết đơn thuốc */
export async function getDoctorPrescriptionById(
    id: string,
    headers: TenantHeaders | null
): Promise<PrescriptionDto> {
    return get<PrescriptionDto>(
        `/doctor-portal/prescriptions/${id}`,
        headers
    )
}

/** Cập nhật đơn thuốc (chẩn đoán, ghi chú) */
export async function updateDoctorPrescription(
    id: string,
    data: UpdatePrescriptionRequest,
    headers: TenantHeaders | null
): Promise<PrescriptionDto> {
    return put<PrescriptionDto>(
        `/doctor-portal/prescriptions/${id}`,
        data,
        headers
    )
}

/** Đổi trạng thái đơn thuốc (DRAFT→ISSUED→DISPENSED, hoặc CANCELLED) */
export async function updateDoctorPrescriptionStatus(
    id: string,
    status: 'DRAFT' | 'ISSUED' | 'DISPENSED' | 'CANCELLED',
    headers: TenantHeaders | null
): Promise<PrescriptionDto> {
    return patch<PrescriptionDto>(
        `/doctor-portal/prescriptions/${id}/status?status=${status}`,
        undefined,
        headers
    )
}

// ═══════════════════════════════════════════════════
//  Gửi Khuyến nghị / Cảnh báo
// ═══════════════════════════════════════════════════

export interface SendAdvicePayload {
    title: string;
    content: string;
    type?: 'ADVICE' | 'ALERT' | 'RECOMMENDATION';
    severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}

/** Gửi lời khuyên cho bệnh nhân */
export async function sendPatientAdvice(
    patientId: string,
    data: SendAdvicePayload,
    headers: TenantHeaders | null
): Promise<string> {
    return post<string>(
        `/doctor-portal/patients/${patientId}/advice`,
        data,
        headers
    )
}

/** Gửi cảnh báo sức khỏe khẩn cấp cho bệnh nhân */
export async function sendPatientAlert(
    patientId: string,
    data: SendAdvicePayload,
    headers: TenantHeaders | null
): Promise<string> {
    return post<string>(
        `/doctor-portal/patients/${patientId}/alert`,
        data,
        headers
    )
}
