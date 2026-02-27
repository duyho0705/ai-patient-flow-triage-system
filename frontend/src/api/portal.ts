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

// --- MOCK DATA SECTION ---
const MOCK_APPOINTMENTS: AppointmentDto[] = [
    {
        id: 'apt-001',
        branchId: 'b-01',
        branchName: 'Phòng khám Đa khoa Hoàn Mỹ, Quận 1',
        patientId: 'p-01',
        patientName: 'Người dùng',
        appointmentDate: '2026-02-25',
        startTime: '08:30',
        endTime: '09:00',
        status: 'CONFIRMED',
        appointmentType: 'Trực tiếp',
        notes: 'Kiểm tra tim mạch định kỳ'
    },
    {
        id: 'apt-002',
        branchId: 'b-01',
        branchName: 'Phòng khám Sống Khỏe Online',
        patientId: 'p-01',
        patientName: 'Người dùng',
        appointmentDate: '2026-02-27',
        startTime: '14:00',
        endTime: '14:30',
        status: 'PENDING',
        appointmentType: 'Online',
        notes: 'Tư vấn dinh dưỡng tiểu đường'
    },
    {
        id: 'apt-003',
        branchId: 'b-01',
        branchName: 'Trung tâm Nội tiết Sống Khỏe',
        patientId: 'p-01',
        patientName: 'Người dùng',
        appointmentDate: '2026-02-20',
        startTime: '09:00',
        endTime: '10:00',
        status: 'COMPLETED',
        appointmentType: 'Trực tiếp',
        notes: 'Tái khám định kỳ'
    },
    {
        id: 'apt-004',
        branchId: 'b-01',
        branchName: 'Phòng khám Đa khoa Hoàn Mỹ, Quận 1',
        patientId: 'p-01',
        patientName: 'Người dùng',
        appointmentDate: '2026-01-15',
        startTime: '10:30',
        endTime: '11:00',
        status: 'CANCELLED',
        appointmentType: 'Trực tiếp',
        notes: 'Kiểm tra sức khỏe tổng quát'
    }
]

const MOCK_HISTORY: ConsultationDto[] = [
    {
        id: 'con-001',
        patientId: 'p-01',
        patientName: 'Người dùng',
        doctorUserId: 'd-01',
        doctorName: 'BS. Lê Minh Tâm',
        status: 'COMPLETED',
        startedAt: '2023-10-15T08:30:00Z',
        endedAt: '2023-10-15T09:00:00Z',
        diagnosisNotes: 'Tiểu đường Type 2, huyết áp ổn định.',
        prescriptionNotes: 'Duy trì Metformin 500mg.',
        acuityLevel: '3',
        chiefComplaintSummary: 'Kiểm tra định kỳ'
    },
    {
        id: 'con-002',
        patientId: 'p-01',
        patientName: 'Người dùng',
        doctorUserId: 'd-02',
        doctorName: 'BS. Nguyễn Thu Thủy',
        status: 'COMPLETED',
        startedAt: '2023-09-12T14:00:00Z',
        endedAt: '2023-09-12T14:30:00Z',
        diagnosisNotes: 'Cao huyết áp độ 1.',
        prescriptionNotes: 'Bắt đầu Lisinopril 10mg.',
        acuityLevel: '3',
        chiefComplaintSummary: 'Nhức đầu nhẹ'
    },
    {
        id: 'con-003',
        patientId: 'p-01',
        patientName: 'Người dùng',
        doctorUserId: 'd-01',
        doctorName: 'BS. Lê Minh Tâm',
        status: 'COMPLETED',
        startedAt: '2023-08-05T10:00:00Z',
        endedAt: '2023-08-05T10:30:00Z',
        diagnosisNotes: 'Rối loạn mỡ máu.',
        prescriptionNotes: 'Atorvastatin 20mg.',
        acuityLevel: '4',
        chiefComplaintSummary: 'Mệt mỏi kéo dài'
    }
]

const MOCK_DASHBOARD: PatientDashboardDto = {
    patientId: 'p-01',
    patientName: 'Người dùng',
    patientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAWRcfVWN7UNQqmFmR_QkId_S16yFYF9D4qL1HCEGGpY5-3KPhxBJEeulAkD4o2y_07OlomR2DODvdhokxKHN3E1plG2S--oSg0AY3yuX7o80xy_4YCf7qFJdn6vXq8whHu05-2d4Zg-Rl2V0DftvfFRyPCkoDMEAXzL1Wz-az_UgvAOmQm0titJ-mFiicY8k1KuO61LfKSQWY00nucGM2bOlz4Fts0NFY9qiNWYinazsxyStpDFQA_XF8kD-kw0PLRpx-MuaWf80',
    activeQueues: 1,
    nextAppointment: MOCK_APPOINTMENTS[0],
    recentVisits: MOCK_HISTORY,
    healthAlerts: ['Đường huyết sáng nay cao hơn mức bình thường.', 'Bạn có lịch tái khám vào ngày mai.']
}

// --- API FUNCTIONS SECTION ---
const MOCK_PROFILE: PatientDto & {
    bloodType?: string;
    height?: string;
    weight?: string;
    chronicConditions?: string[];
    allergies?: string[];
    ongoingMedications?: string[];
    emergencyContact?: { name: string; relationship: string; phone: string };
} = {
    id: 'p-99283',
    tenantId: 't-01',
    cccd: '001075001234',
    fullNameVi: 'Nguyễn Văn A',
    dateOfBirth: '1975-05-15',
    gender: 'MALE',
    phone: '+84 90 123 4567',
    email: 'nguyen.vana@email.com',
    addressLine: '123 Lê Lợi, Phường Bến Thành',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Thành',
    nationality: 'Việt Nam',
    ethnicity: 'Kinh',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbiJ7I6ctWWGnLQNqOglT3drtEvxoxgYwECbwnYBCihONL1qNBKpbHcL2VeMYUVBj31tQd7ASwCsOQomYDGohIQ2rXA8jbkkTL4YM-fQv-tjNXzsQCNAQaHW7nG9UMdlyukB3l3PUh4hEh7vuj6jVuptgmzF1tXf-qIYhm_A4v8uOwZc5wDGnVt7nJTqMvmi9Wh6zLunQYlemDuQWa26BnYtYKxxG7LoL4xdQW2RXEPZBLTGvX4w5JtK0Q0ycV_kMsrUEhwFQLZtA',
    bloodType: 'O+',
    height: '172 cm',
    weight: '68 kg',
    chronicConditions: ['Tiểu đường Typ 2', 'Cao huyết áp'],
    allergies: ['Penicillin', 'Đậu phộng'],
    ongoingMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
    emergencyContact: {
        name: 'Nguyễn Thị B',
        relationship: 'Vợ',
        phone: '+84 91 987 6543'
    }
}

// --- API FUNCTIONS SECTION ---
export async function getPortalProfile(tenant: TenantHeaders | null): Promise<PatientDto> {
    try {
        const data = await get<PatientDto>('/portal/profile', tenant)
        return data.id ? data : MOCK_PROFILE
    } catch {
        return MOCK_PROFILE
    }
}


export async function updatePortalProfile(data: UpdatePatientProfileRequest, tenant: TenantHeaders | null): Promise<PatientDto> {
    return put<PatientDto>('/portal/profile', data, tenant)
}

export async function changePortalPassword(data: ChangePasswordRequest, tenant: TenantHeaders | null): Promise<void> {
    return post<void>('/portal/profile/change-password', data, tenant)
}

export async function getPortalDashboard(tenant: TenantHeaders | null): Promise<PatientDashboardDto> {
    try {
        const data = await get<PatientDashboardDto>('/portal/clinical/dashboard', tenant)
        return data.patientId ? data : MOCK_DASHBOARD
    } catch {
        return MOCK_DASHBOARD
    }
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
    try {
        const data = await get<AppointmentDto[]>('/portal/appointments', tenant)
        return data.length > 0 ? data : MOCK_APPOINTMENTS
    } catch {
        return MOCK_APPOINTMENTS
    }
}

export async function getPortalHistory(tenant: TenantHeaders | null): Promise<ConsultationDto[]> {
    try {
        const data = await get<ConsultationDto[]>('/portal/clinical/medical-history', tenant)
        return data.length > 0 ? data : MOCK_HISTORY
    } catch {
        return MOCK_HISTORY
    }
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

const MOCK_CHAT_DOCTORS = [
    {
        id: 'd-01',
        name: 'BS. Nguyễn Văn An',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2y9wBw8SitILxg_TGGl3CwbmOQ4FE9TNGFjLhqjCzKbOlHyUwc_eXUv4FvbYp5E7bdqCiuuzDNOBZw4FkfttdL6ZkriSrWNH8OKrbFpz4JO6JaQef4zdnvmG4bVBQV5MPyVsWAk2MTWRbsTISbhHsf5WP_-ogb5fxbYoLwRdSslADbE2Iy38B03qJlm5PiiRnpEwESaxK19FHCpdyucpr8Wf5xWF4HicAdjge_EC9FceHVPdzgPygX-NvK7T4vdDhtIc2FDVgouQ',
        specialty: 'Chuyên khoa Nội tiết & Đái tháo đường',
        online: true,
        lastMessage: 'Vâng, chỉ số này hơi cao...',
        lastMessageTime: '2 phút',
        experience: '12 năm',
        rating: 4.9,
        location: 'Phòng khám Quận 1, TP.HCM',
        schedule: '08:00 - 17:00 (T2 - T7)'
    },
    {
        id: 'd-02',
        name: 'BS. Trần Thị Mai',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXXbab1ccgnCKdnhzgiQXMbEgBqhAyFjYgui6FDdCVpRlHZJ48ewQUPiVyZlXtSKlOiyeuoTcBSWMXS0--nPsVarwRhJrUgxHZDMgX2Y9Fszyx7_5pARJQPkmH7KN2EVBXjgnE3H2GEfcPimMNue2EyJyrmoc1JRlC6Dvex1yzWmgpJxMHWVsC6foPCY3lF2DudB5Kdcp3yeOmTWyZZX5S46hnFr3Ao91z_roxOHrSqK23CST2S0qT2IC3oDRsb9Ldu4j79Lhwqng',
        specialty: 'Chuyên khoa Tim mạch',
        online: false,
        lastMessage: 'Hẹn gặp bạn vào tuần tới.',
        lastMessageTime: '1 giờ',
        experience: '8 năm',
        rating: 4.8,
        location: 'Bệnh viện Hoàn Mỹ',
        schedule: '09:00 - 16:00 (T2 - T6)'
    },
    {
        id: 'd-03',
        name: 'BS. Lê Hoàng',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa84EcwSbxEYIfKo-yj-yV4KaprgsjgfFpDRx09iTaxtwu6tkrTejILQ5RyXTh8DQVV-Jm8j2x7h71d_xr4tlijEybplV-DJdGxE-IxjwIIWVUWGSP5Jnbaj6kuCepzWO9751Aj0KvwB3IOS6-v9NtoTxzTf6QOoJtOIORTM9DhTdyr9TaVdsP8NRHHgWSGQ2aIOSDOUW5PL_Y1Ms-HJSn-mBM_eYV_ljGzm2lhA6sC7EYTDs-9DjIvimHoZntr9oyqFIPOZUyHq4',
        specialty: 'Chuyên khoa Nội tổng quát',
        online: true,
        lastMessage: 'Đã nhận kết quả xét nghiệm.',
        lastMessageTime: '5 giờ',
        experience: '15 năm',
        rating: 5.0,
        location: 'Trung tâm Y khoa Sống Khỏe',
        schedule: 'Full-time'
    }
]

const MOCK_CHAT_HISTORY = [
    {
        senderType: 'DOCTOR',
        content: 'Chào bạn, tôi đã nhận được thông báo về chỉ số đường huyết sáng nay của bạn. Bạn cảm thấy thế nào?',
        sentAt: '2026-02-24T14:30:00Z'
    },
    {
        senderType: 'PATIENT',
        content: 'Chào bác sĩ, sáng nay tôi đo được 165 mg/dL sau khi ăn sáng. Tôi thấy hơi chóng mặt nhẹ.',
        sentAt: '2026-02-24T14:35:00Z'
    },
    {
        senderType: 'PATIENT',
        content: 'Kết quả đo huyết áp kèm theo',
        sentAt: '2026-02-24T14:36:00Z',
        isImage: true,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPCX2LKtWkB_Q6JY5_JbL_6fetTiL5EsBhKzry3LMydf_FRwjrwu39p2HuhVgTs2YL-vmU3G4se8Yd_WrQVv8xGJiJ1tYVqL8WDaXIbM01pWwaJxuQCO2QYsIwypyAw216ik5L68D_hLpHyjA5IJJnsG2Xh2kPiyHHbSvH8XPOQydsR4mGrcvmUq-ih476hRUh9HmBUYmcqu8wzXndHgi-_Ow088DYmC8AB3dGJgZE7f7BWBzkgQfnAw_mV7ymevWDx4KX7rdqGwA'
    },
    {
        senderType: 'DOCTOR',
        content: 'Chỉ số này hơi cao so với mức mục tiêu của chúng ta (dưới 140 mg/dL sau ăn). Bạn có quên dùng thuốc sáng nay không?',
        sentAt: '2026-02-24T14:38:00Z'
    },
    {
        senderType: 'DOCTOR',
        content: 'Vui lòng uống thêm nhiều nước lọc, nghỉ ngơi 30 phút và đo lại nhé. Nếu vẫn trên 160 kèm chóng mặt tăng dần, hãy nhắn tôi ngay.',
        sentAt: '2026-02-24T14:39:00Z'
    }
]

export async function getPortalChatDoctors(tenant: TenantHeaders | null): Promise<any[]> {
    try {
        const data = await get<any[]>('/portal/chat/doctors', tenant)
        return data.length > 0 ? data : MOCK_CHAT_DOCTORS
    } catch {
        return MOCK_CHAT_DOCTORS
    }
}

export async function getPortalChatHistory(doctorId: string, tenant: TenantHeaders | null): Promise<any[]> {
    try {
        const data = await get<any[]>(`/portal/chat/history/${doctorId}`, tenant)
        return data.length > 0 ? data : MOCK_CHAT_HISTORY
    } catch {
        return MOCK_CHAT_HISTORY
    }
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

// Vital Trends (with date filter support)
export async function getPortalVitalTrends(
    type: string,
    tenant: TenantHeaders | null,
    from?: string,
    to?: string
): Promise<any[]> {
    let url = `/portal/clinical/vitals/trends?type=${type}`
    if (from && to) {
        url += `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    }
    return get<any[]>(url, tenant)
}

// Upload vital image alongside vital data
export async function logPortalVitalWithImage(
    data: { vitalType: string; valueNumeric: number; unit?: string; notes?: string },
    image: File,
    tenant: TenantHeaders | null
): Promise<PatientVitalLogDto> {
    const formData = new FormData()
    formData.append('vitalType', data.vitalType)
    formData.append('valueNumeric', String(data.valueNumeric))
    if (data.unit) formData.append('unit', data.unit)
    if (data.notes) formData.append('notes', data.notes)
    formData.append('image', image)
    return post<PatientVitalLogDto>('/portal/clinical/vitals/upload', formData, tenant)
}

// Send chat file/image
export async function sendPortalChatFile(
    doctorId: string,
    file: File,
    content: string | undefined,
    tenant: TenantHeaders | null
): Promise<any> {
    const formData = new FormData()
    formData.append('doctorUserId', doctorId)
    formData.append('file', file)
    if (content) formData.append('content', content)
    return post<any>('/portal/chat/send-file', formData, tenant)
}
