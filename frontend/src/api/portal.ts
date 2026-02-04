import { get, post } from './client'
import type { TenantHeaders } from './client'
import type {
    PatientPortalStatusDto,
    PatientDto,
    PatientDashboardDto,
    AppointmentDto,
    ConsultationDto,
    ConsultationDetailDto,
    QueueEntryDto,
    TenantBranchDto,
    SlotAvailabilityDto,
    CreateAppointmentRequest,
    PatientNotificationDto,
    UpdatePatientProfileRequest,
    InvoiceDto,
    ChangePasswordRequest
} from '@/types/api'

export async function getPortalProfile(tenant: TenantHeaders | null): Promise<PatientDto> {
    return get<PatientDto>('/portal/profile', tenant)
}

export async function updatePortalProfile(data: UpdatePatientProfileRequest, tenant: TenantHeaders | null): Promise<PatientDto> {
    return post<PatientDto>('/portal/profile', data, tenant)
}

export async function changePortalPassword(data: ChangePasswordRequest, tenant: TenantHeaders | null): Promise<void> {
    return post<void>('/portal/profile/change-password', data, tenant)
}

export async function getPortalDashboard(tenant: TenantHeaders | null): Promise<PatientDashboardDto> {
    return get<PatientDashboardDto>('/portal/dashboard', tenant)
}

export async function getPortalInvoices(tenant: TenantHeaders | null): Promise<InvoiceDto[]> {
    return get<InvoiceDto[]>('/portal/invoices', tenant)
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

export async function getPortalBranches(tenant: TenantHeaders | null): Promise<TenantBranchDto[]> {
    return get<TenantBranchDto[]>('/portal/branches', tenant)
}

export async function getPortalSlots(branchId: string, date: string, tenant: TenantHeaders | null): Promise<SlotAvailabilityDto[]> {
    return get<SlotAvailabilityDto[]>(`/portal/slots?branchId=${branchId}&date=${date}`, tenant)
}

export async function createPortalAppointment(data: CreateAppointmentRequest, tenant: TenantHeaders | null): Promise<AppointmentDto> {
    return post<AppointmentDto>('/portal/appointments', data, tenant)
}

export async function registerPortalFcmToken(token: string, deviceType: string, tenant: TenantHeaders | null): Promise<void> {
    return post<void>('/portal/register-token', { token, deviceType }, tenant)
}

export async function getPortalNotifications(tenant: TenantHeaders | null): Promise<PatientNotificationDto[]> {
    return get<PatientNotificationDto[]>('/portal/notifications', tenant)
}

export async function markPortalNotificationAsRead(id: string, tenant: TenantHeaders | null): Promise<void> {
    return post<void>(`/portal/notifications/${id}/read`, {}, tenant)
}

export async function markPortalAllNotificationsAsRead(tenant: TenantHeaders | null): Promise<void> {
    return post<void>('/portal/notifications/read-all', {}, tenant)
}

export async function getAiPreTriage(symptoms: string, tenant: TenantHeaders | null): Promise<any> {
    return post<any>('/portal/ai-pre-triage', symptoms, tenant)
}

export async function uploadPortalAvatar(file: File, tenant: TenantHeaders | null): Promise<PatientDto> {
    const formData = new FormData()
    formData.append('file', file)
    return post<PatientDto>('/portal/profile/avatar', formData, tenant)
}
