import { get, post, del, downloadFile } from './client'
import type { TenantHeaders } from './client'

export interface ManagerSummaryDto {
    totalPatients: number
    totalDoctors: number
    highRiskCount: number
    missedFollowUpCount: number
    missedFollowUpPatients: {
        id: string
        fullName: string
        condition: string
        riskLevel: string
    }[]
    diseaseDistribution: Record<string, number>
}

export interface ManagerDoctorDto {
    id: string
    fullName: string
    email: string
    phone: string
    specialty: string
    licenseNumber: string
    bio?: string
}

export async function getManagerSummary(headers: TenantHeaders | null): Promise<ManagerSummaryDto> {
    return get<ManagerSummaryDto>('/management/reports/summary', headers)
}

export async function getManagerDoctors(headers: TenantHeaders | null): Promise<ManagerDoctorDto[]> {
    return get<ManagerDoctorDto[]>('/management/reports/doctors', headers)
}

export async function createManagerDoctor(data: any, headers: TenantHeaders | null): Promise<ManagerDoctorDto> {
    return post<ManagerDoctorDto>('/management/reports/doctors', data, headers)
}

export async function deleteManagerDoctor(id: string, headers: TenantHeaders | null): Promise<void> {
    return del(`/management/reports/doctors/${id}`, headers)
}

export interface AllocationDataDto {
    waitingPatients: Array<{
        id: string
        name: string
        symptoms: string
        riskLevel: string
        chronicConditions: string
        initials: string
    }>
    doctorsWorkload: Array<{
        id: string
        name: string
        specialty: string
        avatar: string | null
        currentPatients: number
        workloadPercentage: number
        status: string
    }>
}

export async function getAllocationData(headers: TenantHeaders | null): Promise<AllocationDataDto> {
    return get<AllocationDataDto>('/management/reports/allocation', headers)
}

export async function allocatePatient(data: { patientId: string; doctorId: string }, headers: TenantHeaders | null): Promise<void> {
    return post('/management/reports/allocation', data, headers)
}

export async function exportPatientExcelReport(headers: TenantHeaders | null) {
    return downloadFile('/management/reports/export-excel', headers, 'patient_report.xlsx')
}

export interface MonthlyReportDto {
    year: number
    month: number
    newPatients: number
    totalConsultations: number
    retentionRate: number
    avgSatisfaction: number
    diseaseDistribution: Record<string, number>
}

export interface DoctorPerformanceDto {
    doctorId: string
    fullName: string
    specialty: string
    consultationCount: number
    prescriptionCount: number
    avgRating: number
    avgConsultationTime: string
    status: string
}

export async function getMonthlyReport(year: number, month: number, headers: TenantHeaders | null): Promise<MonthlyReportDto> {
    return get<MonthlyReportDto>(`/management/reports/monthly?year=${year}&month=${month}`, headers)
}

export async function getDoctorPerformance(headers: TenantHeaders | null): Promise<DoctorPerformanceDto[]> {
    return get<DoctorPerformanceDto[]>('/management/reports/performance', headers)
}
