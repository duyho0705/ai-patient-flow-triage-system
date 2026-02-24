import { get } from './client'
import type { TenantHeaders } from './client'

export interface DoctorInfoDto {
    id: string;
    name: string;
    specialty: string;
    online: boolean;
}

export interface DoctorDashboardDto {
    totalPatientsToday: number;
    pendingConsultations: number;
    completedConsultationsToday: number;
    activeQueue: any[];
    upcomingAppointments: any[];
}

export async function getDoctorProfile(tenant: TenantHeaders | null): Promise<DoctorInfoDto> {
    return get<DoctorInfoDto>('/doctor-portal/profile', tenant)
}

export async function getDoctorDashboard(tenant: TenantHeaders | null): Promise<DoctorDashboardDto> {
    return get<DoctorDashboardDto>('/doctor-portal/dashboard', tenant)
}
