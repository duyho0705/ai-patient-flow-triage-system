import { get, post } from './client'
import type { TenantHeaders } from './client'
import type {
    PatientPortalStatusDto,
    PatientDto,
    PatientDashboardDto,
    AppointmentDto,
    ConsultationDto,
    ConsultationDetailDto,
    QueueEntryDto
} from '@/types/api'

export async function getPortalProfile(tenant: TenantHeaders | null): Promise<PatientDto> {
    return get<PatientDto>('/portal/profile', tenant)
}

export async function getPortalDashboard(tenant: TenantHeaders | null): Promise<PatientDashboardDto> {
    return get<PatientDashboardDto>('/portal/dashboard', tenant)
}

export async function getPortalAppointments(tenant: TenantHeaders | null): Promise<AppointmentDto[]> {
    return get<AppointmentDto[]>('/portal/appointments', tenant)
}

export async function getPortalHistory(tenant: TenantHeaders | null): Promise<ConsultationDto[]> {
    return get<ConsultationDto[]>('/portal/medical-history', tenant)
}

export async function getPortalHistoryDetail(id: string, tenant: TenantHeaders | null): Promise<ConsultationDetailDto> {
    return get<ConsultationDetailDto>(`/portal/medical-history/${id}`, tenant)
}

export async function getPortalQueues(tenant: TenantHeaders | null): Promise<QueueEntryDto[]> {
    return get<QueueEntryDto[]>('/portal/queues', tenant)
}

export async function getPatientPortalStatus(patientId: string, tenant: TenantHeaders | null): Promise<PatientPortalStatusDto> {
    return get<PatientPortalStatusDto>(`/portal/status/${patientId}`, tenant)
}
