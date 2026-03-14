import { get, post, put, patch, type TenantHeaders } from './client'
import type {
    AppointmentDto,
    PatientDto,
    PagedResponse,
    PrescriptionDto,
    UpdatePrescriptionRequest,
    ConsultationDto,
    ConsultationDetailDto
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

/** Danh sách bệnh nhân (phân trang, tìm kiếm, lọc) — Doctor Portal */
export async function getDoctorPatientList(
    headers: TenantHeaders | null,
    page = 0,
    size = 20,
    search?: string,
    riskLevel?: string,
    chronicCondition?: string
): Promise<PagedResponse<PatientDto>> {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('size', String(size))
    if (search) params.set('search', search)
    if (riskLevel) params.set('riskLevel', riskLevel)
    if (chronicCondition) params.set('chronicCondition', chronicCondition)

    return get<PagedResponse<PatientDto>>(
        `/doctor-portal/patients?${params.toString()}`,
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

/** Thêm bệnh nhân mới */
export async function createPatient(
    data: any,
    headers: TenantHeaders | null
): Promise<PatientDto> {
    return post<PatientDto>(
        `/patients`,
        data,
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

/** Lấy lịch sử khám của bệnh nhân (Dành cho bác sĩ) */
export async function getPatientMedicalHistory(
    patientId: string,
    headers: TenantHeaders | null,
    page = 0,
    size = 10
): Promise<PagedResponse<ConsultationDto>> {
    return get<PagedResponse<ConsultationDto>>(
        `/doctor-portal/patients/${patientId}/history?page=${page}&size=${size}`,
        headers
    )
}

/** Chi tiết ca khám của bệnh nhân (Dành cho bác sĩ) */
export async function getConsultationDetailForDoctor(
    patientId: string,
    consultationId: string,
    headers: TenantHeaders | null
): Promise<ConsultationDetailDto> {
    return get<ConsultationDetailDto>(
        `/doctor-portal/patients/${patientId}/history/${consultationId}`,
        headers
    )
}

/** Xuất báo cáo sức khỏe bệnh nhân (PDF) — Doctor Portal */
export async function exportPatientReportPdf(
    patientId: string,
    headers: TenantHeaders | null
): Promise<Blob> {
    const url = `${process.env.VITE_API_BASE_URL || ''}/doctor-portal/patients/${patientId}/export-pdf`
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            ...headers,
            'Accept': 'application/pdf'
        } as HeadersInit
    })
    
    if (!res.ok) throw new Error('Failed to export PDF')
    return await res.blob()
}

// ═══════════════════════════════════════════════════

/** Danh mục Thuốc (Search) để thêm vào đơn */
export async function searchPharmacyProducts(
    headers: TenantHeaders | null,
    search: string = '',
    page = 0,
    size = 20
): Promise<PagedResponse<any>> {
    return get<PagedResponse<any>>(
        `/doctor-portal/pharmacy/products?search=${encodeURIComponent(search)}&page=${page}&size=${size}`,
        headers
    )
}

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

/** Tạo đơn thuốc mới */
export async function createDoctorPrescription(
    data: any,
    headers: TenantHeaders | null
): Promise<PrescriptionDto> {
    return post<PrescriptionDto>(
        `/doctor-portal/prescriptions`,
        data,
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

/** Xuất đơn thuốc điện tử (PDF) */
export async function exportPrescriptionPdf(
    id: string,
    headers: TenantHeaders | null
): Promise<Blob> {
    const url = `${process.env.VITE_API_BASE_URL || ''}/doctor-portal/prescriptions/${id}/export-pdf`
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            ...headers,
            'Accept': 'application/pdf'
        } as HeadersInit
    })
    
    if (!res.ok) throw new Error('Failed to export Prescription PDF')
    return await res.blob()
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

// ═══════════════════════════════════════════════════
//  Risk Analysis
// ═══════════════════════════════════════════════════

export interface RiskInsightDto {
    type: string
    title: string
    description: string
}

export interface RiskAnalysisDashboardDto {
    criticalPatientsCount: number
    newAlerts24hCount: number
    stablePatientsPercentage: number
    priorityList: any[]
    aiInsights: RiskInsightDto[]
    riskTrend7Days: number[]
}

export async function getDoctorRiskAnalysis(
    headers: TenantHeaders | null
): Promise<RiskAnalysisDashboardDto> {
    return get<RiskAnalysisDashboardDto>('/doctor-portal/risk-analysis', headers)
}

/** Xuất báo cáo rủi ro tổng hợp (PDF) */
export async function exportRiskReportPdf(
    headers: TenantHeaders | null
): Promise<Blob> {
    const url = `${process.env.VITE_API_BASE_URL || ''}/doctor-portal/risk-analysis/export-pdf`
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            ...headers,
            'Accept': 'application/pdf'
        } as HeadersInit
    })
    
    if (!res.ok) throw new Error('Failed to export Risk Report PDF')
    return await res.blob()
}
