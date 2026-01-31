export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface AuthUserDto {
  id: string
  email: string
  fullNameVi: string
  roles: string[]
  tenantId: string
  branchId: string | null
}

export interface LoginRequest {
  email: string
  password: string
  tenantId: string
  branchId?: string | null
}

export interface LoginResponse {
  token: string
  expiresAt: string
  user: AuthUserDto
}

export interface UserRoleAssignmentDto {
  tenantId: string
  tenantName?: string
  branchId?: string | null
  branchName?: string | null
  roleCode: string
}

export interface AdminUserDto {
  id: string
  email: string
  fullNameVi: string
  phone?: string | null
  isActive: boolean
  lastLoginAt?: string | null
  roleAssignments: UserRoleAssignmentDto[]
}

export interface CreateUserRequest {
  email: string
  fullNameVi: string
  password: string
  phone?: string | null
  tenantId: string
  roleCode: string
  branchId?: string | null
}

export interface UpdateUserRequest {
  fullNameVi?: string
  isActive?: boolean
  roleAssignments?: { tenantId: string; roleCode: string; branchId?: string | null }[]
}

export interface SetPasswordRequest {
  newPassword: string
}

export interface RoleDto {
  id: string
  code: string
  nameVi: string
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

export interface AiTriageAuditDto {
  id: string
  triageSessionId: string
  suggestedAcuity: string | null
  actualAcuity: string
  matched: boolean
  calledAt: string
  latencyMs: number | null
  patientId: string
  branchId: string
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
  overrideReason?: string
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
  overrideReason?: string
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
  /** Mức ưu tiên từ phiên phân loại (1–5). */
  acuityLevel?: string | null
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
