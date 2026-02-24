import { get, post, patch } from './client'
import type { TenantHeaders } from './client'
import type { ConsultationDto, CreateConsultationRequest } from '@/types/api'

export async function getConsultation(
    id: string,
    tenant: TenantHeaders | null
): Promise<ConsultationDto> {
    return get<ConsultationDto>(`/clinical/consultations/${id}`, tenant)
}

export async function getPatientHistory(
    patientId: string,
    tenant: TenantHeaders | null
): Promise<ConsultationDto[]> {
    return get<ConsultationDto[]>(`/clinical/consultations/history?patientId=${patientId}`, tenant)
}

export async function startConsultation(
    request: CreateConsultationRequest,
    tenant: TenantHeaders | null
): Promise<ConsultationDto> {
    return post<ConsultationDto>('/clinical/consultations', request, tenant)
}

export async function updateConsultation(
    id: string,
    request: CreateConsultationRequest,
    tenant: TenantHeaders | null
): Promise<ConsultationDto> {
    return patch<ConsultationDto>(`/clinical/consultations/${id}`, request, tenant)
}

export async function completeConsultation(
    id: string,
    tenant: TenantHeaders | null
): Promise<ConsultationDto> {
    return post<ConsultationDto>(`/clinical/consultations/${id}/complete`, undefined, tenant)
}

export async function createPrescription(
    data: any,
    tenant: TenantHeaders | null
): Promise<any> {
    return post<any>('/prescriptions', data, tenant)
}

export async function getVitals(
    consultationId: string,
    tenant: TenantHeaders | null
): Promise<any[]> {
    return get<any[]>(`/clinical/consultations/${consultationId}/vitals`, tenant)
}

export async function getAiClinicalSupport(
    id: string,
    tenant: TenantHeaders | null
): Promise<string> {
    return post<string>(`/doctor-portal/ai-support/${id}/ai-clinical-support`, {}, tenant)
}

export async function getCdsAdvice(
    id: string,
    tenant: TenantHeaders | null
): Promise<any> {
    return get<any>(`/doctor-portal/consultations/${id}/cds-advice`, tenant)
}

export async function getEarlyWarning(id: string, tenant: TenantHeaders | null): Promise<any> {
    return get<any>(`/doctor-portal/consultations/${id}/early-warning`, tenant)
}

export async function getSuggestedTemplates(id: string, tenant: TenantHeaders | null): Promise<string> {
    return get<string>(`/doctor-portal/ai-support/${id}/suggested-templates`, tenant)
}

export async function sendClinicalAiChat(
    id: string,
    message: string,
    tenant: TenantHeaders | null
): Promise<string> {
    return post<string>(`/doctor-portal/ai-support/${id}/ai-chat`, { message, history: [] }, tenant)
}

export async function verifyPrescriptionAi(
    id: string,
    items: any[],
    tenant: TenantHeaders | null
): Promise<string> {
    return post<string>(`/doctor-portal/ai-support/${id}/verify-prescription`, items, tenant)
}

export async function orderDiagnosticImage(
    id: string,
    title: string,
    tenant: TenantHeaders | null
): Promise<void> {
    return post<void>(`/doctor-portal/consultations/${id}/diagnostic-images/order`, title, tenant)
}

export async function getLabResults(
    id: string,
    tenant: TenantHeaders | null
): Promise<any[]> {
    return get<any[]>(`/doctor-portal/consultations/${id}/lab-results`, tenant)
}

export async function getDiagnosticImages(
    id: string,
    tenant: TenantHeaders | null
): Promise<any[]> {
    return get<any[]>(`/doctor-portal/consultations/${id}/diagnostic-images`, tenant)
}

export async function downloadConsultationPdf(
    id: string,
    tenant: TenantHeaders | null
): Promise<void> {
    const { downloadFile } = await import('./client')
    return downloadFile(`/doctor-portal/consultations/${id}/pdf`, tenant, `consultation_summary_${id}.pdf`)
}

export async function getChronicConditions(patientId: string, tenant: TenantHeaders | null): Promise<any[]> {
    return get<any[]>(`/staff/chronic/conditions?patientId=${patientId}`, tenant)
}

export async function getVitalTargets(patientId: string, tenant: TenantHeaders | null): Promise<any[]> {
    return get<any[]>(`/staff/chronic/targets?patientId=${patientId}`, tenant)
}

export async function getMedicationReminders(patientId: string, tenant: TenantHeaders | null): Promise<any[]> {
    return get<any[]>(`/patient/medication-reminders?patientId=${patientId}`, tenant)
}

export async function getCarePlan(id: string, tenant: TenantHeaders | null): Promise<string> {
    return get<string>(`/doctor-portal/ai-support/${id}/care-plan`, tenant)
}

export async function getVitalHistory(patientId: string, tenant: TenantHeaders | null): Promise<any[]> {
    return get<any[]>(`/staff/chronic/vitals?patientId=${patientId}`, tenant)
}

export async function downloadCdmReport(id: string, carePlan: string | null, tenant: TenantHeaders | null) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/doctor-portal/ai-support/${id}/cdm-report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(tenant || {})
        },
        body: JSON.stringify(carePlan || '')
    });

    if (!response.ok) throw new Error('Failed to download report');
    return response.blob();
}

export async function sendCdmReport(id: string, carePlan: string | null, tenant: TenantHeaders | null): Promise<string> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/doctor-portal/ai-support/${id}/cdm-report/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(tenant || {})
        },
        body: JSON.stringify(carePlan || '')
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to send report');
    return result.data;
}

export async function getFollowUpSuggestion(id: string, tenant: TenantHeaders | null): Promise<any> {
    return get<any>(`/doctor-portal/ai-support/${id}/follow-up-suggestion`, tenant)
}

export async function triggerMedicationReminder(reminderId: string, tenant: TenantHeaders | null): Promise<string> {
    const result = await post<any>(`/doctor-portal/ai-support/reminders/${reminderId}/trigger`, {}, tenant)
    return result as string
}

export async function getTreatmentEfficacy(id: string, tenant: TenantHeaders | null): Promise<any> {
    return get<any>(`/doctor-portal/ai-support/${id}/treatment-efficacy`, tenant)
}

export async function getComplicationRisk(id: string, tenant: TenantHeaders | null): Promise<any> {
    return get<any>(`/doctor-portal/ai-support/${id}/complication-risk`, tenant)
}

export async function getStandardizedNote(id: string, tenant: TenantHeaders | null): Promise<any> {
    return get<any>(`/doctor-portal/ai-support/${id}/standardized-note`, tenant)
}
