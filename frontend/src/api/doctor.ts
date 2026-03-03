import { get, type TenantHeaders } from './client'
import type {
    AppointmentDto,
    PatientDto,
    PagedResponse
} from '@/types/api'

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

export async function getDoctorDashboard(headers: TenantHeaders | null): Promise<DoctorDashboardDto> {
    // client.ts unwraps ApiResponse automatically
    return get<DoctorDashboardDto>('/doctor-portal/dashboard', headers)
}

export async function getDoctorPatients(headers: TenantHeaders | null, page = 0, size = 20): Promise<PagedResponse<PatientDto>> {
    return get<PagedResponse<PatientDto>>(`/patients?page=${page}&size=${size}`, headers)
}

export async function getPatientFullProfile(patientId: string, headers: TenantHeaders | null): Promise<PatientDto> {
    return get<PatientDto>(`/doctor-portal/patients/${patientId}/full-profile`, headers)
}

export async function getPatientClinicalSummary(patientId: string, headers: TenantHeaders | null): Promise<string> {
    return get<string>(`/doctor-portal/patients/${patientId}/clinical-summary`, headers)
}
