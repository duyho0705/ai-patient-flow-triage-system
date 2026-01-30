export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface TenantDto {
  id: string
  code: string
  nameVi: string
  nameEn?: string
  taxCode?: string
  locale?: string
  timezone?: string
}

export interface TenantBranchDto {
  id: string
  tenantId: string
  code: string
  nameVi: string
  addressLine?: string
  city?: string
  district?: string
  ward?: string
  phone?: string
}

export interface PatientDto {
  id: string
  tenantId: string
  externalId?: string
  cccd?: string
  fullNameVi: string
  dateOfBirth: string
  gender?: string
  phone?: string
  email?: string
  addressLine?: string
  city?: string
  district?: string
  ward?: string
  nationality?: string
  ethnicity?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreatePatientRequest {
  externalId?: string
  cccd?: string
  fullNameVi: string
  dateOfBirth: string
  gender?: string
  phone?: string
  email?: string
  addressLine?: string
  city?: string
  district?: string
  ward?: string
  nationality?: string
  ethnicity?: string
}

export interface TriageSessionDto {
  id: string
  tenantId: string
  branchId: string
  patientId: string
  appointmentId?: string
  triagedByUserId?: string
  startedAt: string
  endedAt?: string
  acuityLevel: string
  acuitySource?: string
  aiSuggestedAcuity?: string
  aiConfidenceScore?: number
  chiefComplaintText?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface TriageSuggestionDto {
  suggestedAcuity: string
  confidence: number
  latencyMs: number
  providerKey: string
}

export interface SuggestAcuityRequest {
  chiefComplaintText?: string
  ageInYears?: number
  patientId?: string
  vitals?: { vitalType: string; valueNumeric?: number; unit?: string }[]
  complaintTypes?: string[]
}

export interface ComplaintItem {
  complaintType?: string
  complaintText: string
  displayOrder: number
}

export interface VitalItem {
  vitalType: string
  valueNumeric?: number
  unit?: string
  recordedAt: string
}

export interface CreateTriageSessionRequest {
  branchId: string
  patientId: string
  appointmentId?: string
  triagedByUserId?: string
  startedAt: string
  acuityLevel?: string
  acuitySource?: string
  aiSuggestedAcuity?: string
  aiConfidenceScore?: number
  chiefComplaintText?: string
  notes?: string
  useAiSuggestion?: boolean
  complaints?: ComplaintItem[]
  vitals?: VitalItem[]
}

export interface QueueDefinitionDto {
  id: string
  branchId: string
  code: string
  nameVi: string
  acuityFilter?: string
  displayOrder?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface QueueEntryDto {
  id: string
  tenantId: string
  branchId: string
  queueDefinitionId: string
  patientId: string
  triageSessionId?: string
  appointmentId?: string
  position?: number
  status: string
  joinedAt: string
  calledAt?: string
  completedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface UpdateQueueEntryRequest {
  status?: string
  calledAt?: string
  completedAt?: string
  position?: number
}
