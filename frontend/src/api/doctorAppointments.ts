import { get, post, patch, type TenantHeaders } from './client'
import type {
    AppointmentDto,
    PagedResponse,
    SlotAvailabilityDto,
    DoctorCreateAppointmentRequest
} from '@/types/api'

// ═══════════════════════════════════════════════════
//  Lịch hẹn — Doctor Portal
// ═══════════════════════════════════════════════════

/**
 * Danh sách lịch hẹn của bác sĩ (lọc theo khoảng ngày, phân trang).
 *
 * @param from  Ngày bắt đầu (YYYY-MM-DD)
 * @param to    Ngày kết thúc (YYYY-MM-DD)
 */
export async function getDoctorAppointments(
    from: string,
    to: string,
    headers: TenantHeaders | null,
    page = 0,
    size = 20
): Promise<PagedResponse<AppointmentDto>> {
    return get<PagedResponse<AppointmentDto>>(
        `/doctor-portal/appointments?from=${from}&to=${to}&page=${page}&size=${size}`,
        headers
    )
}

/** Lịch hẹn hôm nay của bác sĩ */
export async function getDoctorTodayAppointments(
    headers: TenantHeaders | null
): Promise<AppointmentDto[]> {
    return get<AppointmentDto[]>(
        '/doctor-portal/appointments/today',
        headers
    )
}

/**
 * Đặt lịch tái khám cho bệnh nhân.
 *
 * Backend sẽ tự gán doctorUser = bác sĩ hiện tại,
 * và status = SCHEDULED.
 */
export async function createDoctorAppointment(
    data: DoctorCreateAppointmentRequest,
    headers: TenantHeaders | null
): Promise<AppointmentDto> {
    return post<AppointmentDto>(
        '/doctor-portal/appointments',
        data,
        headers
    )
}

/**
 * Cập nhật trạng thái lịch hẹn.
 *
 * @param status  COMPLETED | CANCELLED | NO_SHOW
 */
export async function updateDoctorAppointmentStatus(
    id: string,
    status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW',
    headers: TenantHeaders | null
): Promise<AppointmentDto> {
    return patch<AppointmentDto>(
        `/doctor-portal/appointments/${id}/status?status=${status}`,
        undefined,
        headers
    )
}

/**
 * Xem slot trống theo chi nhánh và ngày.
 *
 * @param branchId  UUID chi nhánh
 * @param date      Ngày (YYYY-MM-DD)
 */
export async function getDoctorAvailableSlots(
    branchId: string,
    date: string,
    headers: TenantHeaders | null
): Promise<SlotAvailabilityDto[]> {
    return get<SlotAvailabilityDto[]>(
        `/doctor-portal/appointments/slots?branchId=${branchId}&date=${date}`,
        headers
    )
}
