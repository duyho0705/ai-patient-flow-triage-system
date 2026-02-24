import { get, post, put, del } from './client'
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
    ChangePasswordRequest,
    AiChatRequest,
    AiChatResponse,
    PatientRelativeDto,
    PatientInsuranceDto,
    PatientVitalLogDto,
    MedicationDosageLogDto
} from '@/types/api'

export async function getPortalProfile(tenant: TenantHeaders | null): Promise<PatientDto> {
    return get<PatientDto>('/portal/profile', tenant)
}

export async function updatePortalProfile(data: UpdatePatientProfileRequest, tenant: TenantHeaders | null): Promise<PatientDto> {
    return put<PatientDto>('/portal/profile', data, tenant)
}

export async function changePortalPassword(data: ChangePasswordRequest, tenant: TenantHeaders | null): Promise<void> {
    return post<void>('/portal/profile/change-password', data, tenant)
}

export async function getPortalDashboard(tenant: TenantHeaders | null): Promise<PatientDashboardDto> {
    return get<PatientDashboardDto>('/portal/clinical/dashboard', tenant)
}

export async function getPortalInvoices(tenant: TenantHeaders | null): Promise<InvoiceDto[]> {
    return get<InvoiceDto[]>('/portal/billing/invoices', tenant)
}

export async function payPortalInvoice(id: string, method: string, tenant: TenantHeaders | null): Promise<InvoiceDto> {
    return post<InvoiceDto>(`/portal/billing/invoices/${id}/pay`, method, tenant)
}

export async function getVnpayPaymentUrl(id: string, returnUrl: string, tenant: TenantHeaders | null): Promise<string> {
    const res = await get<{ paymentUrl: string }>(`/portal/billing/invoices/${id}/vnpay-url?returnUrl=${encodeURIComponent(returnUrl)}`, tenant)
    return res.paymentUrl
}

export async function getPortalAppointments(tenant: TenantHeaders | null): Promise<AppointmentDto[]> {
    return get<AppointmentDto[]>('/portal/appointments', tenant)
}

export async function getPortalHistory(tenant: TenantHeaders | null): Promise<ConsultationDto[]> {
    return get<ConsultationDto[]>('/portal/clinical/medical-history', tenant)
}

export async function getPortalHistoryDetail(id: string, tenant: TenantHeaders | null): Promise<ConsultationDetailDto> {
    return get<ConsultationDetailDto>(`/portal/clinical/medical-history/${id}`, tenant)
}

export async function getPortalQueues(tenant: TenantHeaders | null): Promise<QueueEntryDto[]> {
    return get<QueueEntryDto[]>('/portal/clinical/queues', tenant)
}

export async function downloadPrescriptionPdf(id: string, tenant: TenantHeaders | null): Promise<void> {
    const { downloadFile } = await import('./client')
    return downloadFile(`/portal/prescriptions/${id}/pdf`, tenant, `Don_thuoc_${id.slice(0, 8)}.pdf`)
}

export async function downloadPortalConsultationPdf(id: string, tenant: TenantHeaders | null): Promise<void> {
    const { downloadFile } = await import('./client')
    return downloadFile(`/portal/medical-history/${id}/pdf`, tenant, `Tom_tat_kham_benh_${id.slice(0, 8)}.pdf`)
}

export async function getPatientPortalStatus(patientId: string, tenant: TenantHeaders | null): Promise<PatientPortalStatusDto> {
    return get<PatientPortalStatusDto>(`/portal/status/${patientId}`, tenant)
}

export async function getPortalBranches(tenant: TenantHeaders | null): Promise<TenantBranchDto[]> {
    return get<TenantBranchDto[]>('/portal/branches', tenant)
}

export async function getPortalSlots(branchId: string, date: string, tenant: TenantHeaders | null): Promise<SlotAvailabilityDto[]> {
    return get<SlotAvailabilityDto[]>(`/portal/appointments/slots?branchId=${branchId}&date=${date}`, tenant)
}

export async function createPortalAppointment(data: CreateAppointmentRequest, tenant: TenantHeaders | null): Promise<AppointmentDto> {
    return post<AppointmentDto>('/portal/appointments', data, tenant)
}

export async function registerPortalFcmToken(token: string, deviceType: string, tenant: TenantHeaders | null): Promise<void> {
    return post<void>('/portal/notifications/register-token', { token, deviceType }, tenant)
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

export async function getAiChat(data: AiChatRequest, tenant: TenantHeaders | null): Promise<AiChatResponse> {
    return post<AiChatResponse>('/portal/ai/assistant', data, tenant)
}

export async function getAiPreTriage(symptoms: string, tenant: TenantHeaders | null): Promise<any> {
    return post<any>('/portal/ai/pre-triage', symptoms, tenant)
}

export async function uploadPortalAvatar(file: File, tenant: TenantHeaders | null): Promise<PatientDto> {
    const formData = new FormData()
    formData.append('file', file)
    return post<PatientDto>('/portal/profile/avatar', formData, tenant)
}

export async function getPortalFamily(tenant: TenantHeaders | null): Promise<PatientRelativeDto[]> {
    return get<PatientRelativeDto[]>('/portal/profile/family', tenant)
}

export async function addPortalRelative(data: any, tenant: TenantHeaders | null): Promise<PatientRelativeDto> {
    return post<PatientRelativeDto>('/portal/profile/family', data, tenant)
}

export async function updatePortalRelative(id: string, data: any, tenant: TenantHeaders | null): Promise<PatientRelativeDto> {
    return put<PatientRelativeDto>(`/portal/profile/family/${id}`, data, tenant)
}

export async function deletePortalRelative(id: string, tenant: TenantHeaders | null): Promise<void> {
    return del<void>(`/portal/profile/family/${id}`, tenant)
}

export async function getPortalInsurance(tenant: TenantHeaders | null): Promise<PatientInsuranceDto[]> {
    return get<PatientInsuranceDto[]>('/portal/profile/insurance', tenant)
}

export async function addPortalInsurance(data: any, tenant: TenantHeaders | null): Promise<PatientInsuranceDto> {
    return post<PatientInsuranceDto>('/portal/profile/insurance', data, tenant)
}

export async function deletePortalInsurance(id: string, tenant: TenantHeaders | null): Promise<void> {
    return del<void>(`/portal/profile/insurance/${id}`, tenant)
}

export async function seedMedicalData(tenant: TenantHeaders | null): Promise<void> {
    return post<void>('/portal/ai/seed-medical-data', {}, tenant)
}

export async function getPortalChatDoctors(tenant: TenantHeaders | null): Promise<any[]> {
    return get<any[]>('/portal/chat/doctors', tenant)
}

export async function getPortalChatHistory(doctorId: string, tenant: TenantHeaders | null): Promise<any[]> {
    return get<any[]>(`/portal/chat/history/${doctorId}`, tenant)
}

export async function sendPortalChatMessage(doctorId: string, content: string, tenant: TenantHeaders | null): Promise<any> {
    return post<any>('/portal/chat/send', { doctorUserId: doctorId, content }, tenant)
}

// Medication Reminders
export async function getPortalMedicationReminders(tenant: TenantHeaders | null): Promise<any[]> {
    return get<any[]>('/portal/medication-reminders', tenant)
}

export async function togglePortalMedicationReminder(id: string, active: boolean, tenant: TenantHeaders | null): Promise<any> {
    return put<any>(`/portal/medication-reminders/${id}`, { isActive: active }, tenant)
}

export async function createPortalMedicationReminder(data: any, tenant: TenantHeaders | null): Promise<any> {
    return post<any>('/portal/medication-reminders', data, tenant)
}

export async function logPortalVital(data: PatientVitalLogDto, tenant: TenantHeaders | null): Promise<PatientVitalLogDto> {
    return post<PatientVitalLogDto>('/portal/clinical/vitals', data, tenant)
}

export async function logMedicationTaken(data: MedicationDosageLogDto, tenant: TenantHeaders | null): Promise<MedicationDosageLogDto> {
    return post<MedicationDosageLogDto>('/portal/medication-reminders/log', data, tenant)
}
