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

export interface RegisterRequest {
  email: string
  password: string
  fullNameVi: string
  tenantId: string
  branchId?: string | null
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
  settingsJson?: string
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
  isActive?: boolean
}

export interface MedicalServiceDto {
  id: string
  code: string
  nameVi: string
  description?: string
  category?: string
  unitPrice: number
  isActive: boolean
}


export interface CreateTenantRequest {
  code: string
  nameVi: string
  nameEn?: string
  taxCode?: string
  locale?: string
  timezone?: string
}

export interface CreateBranchRequest {
  tenantId: string
  code: string
  nameVi: string
  addressLine?: string
  city?: string
  district?: string
  ward?: string
  phone?: string
}

export interface UpdateTenantSettingsRequest {
  settingsJson: string
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
  avatarUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface UpdatePatientProfileRequest {
  fullNameVi?: string
  dateOfBirth?: string
  gender?: string
  phone?: string
  email?: string
  addressLine?: string
  city?: string
  district?: string
  ward?: string
  nationality?: string
  ethnicity?: string
  cccd?: string
  isActive?: boolean
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
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
  explanation?: string
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
  aiExplanation?: string
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
  description?: string
  acuityFilter?: string
  roomOrStation?: string
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
  patientName?: string
  triageSessionId?: string
  appointmentId?: string
  medicalServiceId?: string
  medicalServiceName?: string
  queueName?: string
  notes?: string
  position?: number
  peopleAhead?: number
  status: string
  /** Mức ưu tiên từ phiên phân loại (1–5). */
  acuityLevel?: string | null
  joinedAt: string
  calledAt?: string
  completedAt?: string
  estimatedWaitMinutes?: number
  createdAt?: string
  updatedAt?: string
}

export interface UpdateQueueEntryRequest {
  status?: string
  calledAt?: string
  completedAt?: string
  position?: number
}

export interface ConsultationDto {
  id: string
  patientId: string
  patientName?: string
  doctorUserId?: string
  doctorName?: string
  status: string
  startedAt: string
  endedAt?: string
  diagnosisNotes?: string
  prescriptionNotes?: string
  queueEntryId?: string
  triageSessionId?: string
  acuityLevel?: string
  chiefComplaintSummary?: string
  aiExplanation?: string
  aiConfidenceScore?: number
  aiInsights?: string
}

export interface CreateConsultationRequest {
  patientId?: string
  queueEntryId?: string
  diagnosisNotes?: string
  prescriptionNotes?: string
}

export interface WaitTimeSummaryDto {
  branchId: string
  branchName: string
  fromDate: string
  toDate: string
  averageWaitMinutes: number | null
  totalCompletedEntries: number
}

export interface DailyVolumeDto {
  date: string
  branchId: string
  branchName: string
  triageCount: number
  completedQueueEntries: number
}

export interface AiEffectivenessDto {
  branchId: string
  branchName: string
  fromDate: string
  toDate: string
  totalSessions: number
  aiSessions: number
  humanSessions: number
  matchCount: number
  overrideCount: number
  matchRate: number | null
  overrideRate: number | null
}

export interface RevenueByDayDto {
  date: string
  amount: number
}

export interface RevenueReportDto {
  branchId: string
  branchName: string
  fromDate: string
  toDate: string
  totalRevenue: number
  dailyRevenue: RevenueByDayDto[]
  topServices?: {
    serviceName: string
    amount: number
    count: number
  }[]
}

export interface AppointmentDto {
  id: string
  branchId: string
  branchName: string
  patientId: string
  patientName: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  appointmentType?: string
  notes?: string
}

export interface PatientDashboardDto {
  patientId?: string
  branchId?: string
  branchName?: string
  patientName: string
  patientAvatar?: string
  activeQueues: number
  nextAppointment?: AppointmentDto
  recentVisits: ConsultationDto[]
  lastVitals?: TriageVitalDto[]
  vitalHistory?: TriageVitalDto[]
  latestPrescription?: PrescriptionDto
  pendingInvoice?: InvoiceDto
  medicationReminders?: MedicationReminderDto[]
  healthAlerts?: string[]
}

export interface LabResultDto {
  id: string
  testName: string
  value: string
  unit: string
  referenceRange: string
  status: 'NORMAL' | 'HIGH' | 'LOW'
}

export interface DiagnosticImageDto {
  id: string
  title: string
  imageUrl: string
  description: string
  recordedAt: string
}

export interface PatientRelativeDto {
  id: string
  fullName: string
  relationship: string
  phoneNumber?: string
  gender?: string
  age?: number
  avatarUrl?: string
}

export interface PatientInsuranceDto {
  id: string
  insuranceType: string
  insuranceNumber: string
  holderName?: string
  validFrom?: string
  validTo?: string
  isPrimary: boolean
}

export interface ConsultationDetailDto {
  consultation: ConsultationDto
  prescription?: PrescriptionDto
  invoice?: InvoiceDto
  vitals: TriageVitalDto[]
  labResults?: LabResultDto[]
  diagnosticImages?: DiagnosticImageDto[]
}

export interface InvoiceItemDto {
  id: string
  itemCode?: string
  itemName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface InvoiceDto {
  id: string
  invoiceNumber: string
  patientId: string
  patientName: string
  consultationId?: string
  totalAmount: number
  discountAmount: number
  finalAmount: number
  status: string // PENDING, PAID, CANCELLED
  paymentMethod?: string
  paidAt?: string
  createdAt: string
  items: InvoiceItemDto[]
}

export interface CreateInvoiceRequest {
  patientId: string
  branchId?: string
  consultationId?: string
  discountAmount?: number
  notes?: string
  items: {
    itemCode?: string
    itemName: string
    quantity: number
    unitPrice: number
  }[]
}

export interface PharmacyProductDto {
  id: string
  code: string
  nameVi: string
  genericName?: string
  unit: string
  standardPrice: number
  active: boolean
}

export interface PharmacyInventoryDto {
  id: string
  branchId: string
  product: PharmacyProductDto
  currentStock: number
  minStockLevel: number
  lastRestockAt?: string
  updatedAt: string
}

export interface InventoryTransactionDto {
  id: string
  branchId: string
  product: PharmacyProductDto
  type: 'PURCHASE' | 'DISPENSE' | 'ADJUSTMENT' | 'TRANSFER'
  quantity: number
  referenceId?: string
  performedByUserId?: string
  performedByUserName?: string
  notes?: string
  createdAt: string
}

export interface PrescriptionItemDto {
  id?: string
  productId?: string
  productName?: string
  quantity: number
  dosageInstruction: string
  unitPrice?: number
  availableStock?: number
}

export interface PrescriptionDto {
  id: string
  consultationId: string
  patientId: string
  patientName: string
  doctorUserId?: string
  doctorName?: string
  status: string
  notes?: string
  invoiceStatus?: string
  items: PrescriptionItemDto[]
}

export interface CreatePrescriptionRequest {
  consultationId: string
  notes?: string
  items: {
    productId?: string
    productNameCustom?: string
    quantity: number
    dosageInstruction: string
    unitPrice?: number
  }[]
}

export interface DisplayEntryDto {
  patientName: string
  queueName: string
  status: string
  acuityLevel?: string
}

export interface PublicDisplayDto {
  branchName: string
  calling: DisplayEntryDto[]
  waiting: DisplayEntryDto[]
}

export interface KioskRegistrationRequest {
  fullName: string
  phone: string
  dateOfBirth: string
  branchId: string
  queueDefinitionId: string
  appointmentId?: string
}

export interface TriageVitalDto {
  id: string
  vitalType: string
  valueNumeric: number
  unit: string
  recordedAt: string
}

export interface TimelineItemDto {
  id: string
  type: 'TRIAGE' | 'CONSULTATION' | 'INVOICE' | 'PRESCRIPTION'
  timestamp: string
  title: string
  subtitle: string
  content: string
  status: string
}

export interface PatientPortalStatusDto {
  patientName: string
  queueName?: string
  status: string
  peopleAhead: number
  estimatedWaitMinutes?: number
}

export interface AuditLogDto {
  id: string
  userEmail: string
  action: string
  resourceType: string
  resourceId: string
  details: string
  createdAt: string
}

export interface SlotAvailabilityDto {
  startTime: string
  endTime: string
  available: boolean
}

export interface CreateAppointmentRequest {
  branchId: string
  appointmentDate: string
  slotStartTime: string
  slotEndTime: string
  appointmentType?: string
  notes?: string
}

export interface AiChatRequest {
  message: string
  history?: { role: string; content: string }[]
}

export interface AiChatResponse {
  response: string
  suggestions?: string[]
}

export interface PatientNotificationDto {
  id: string
  title: string
  content: string
  type: string
  relatedResourceId?: string
  isRead: boolean
  createdAt: string
}

export interface PatientChatMessageDto {
  id: string
  senderType: string // PATIENT or DOCTOR
  content: string
  sentAt: string
}

export interface PatientChatConversationDto {
  id: string
  patientId: string
  patientName: string
  lastMessage?: string
  lastMessageAt?: string
  status: string
}

export interface CdsWarning {
  type: string
  message: string
  severity: 'INFO' | 'WARNING' | 'ERROR'
}

export interface CdsSuggestion {
  title: string
  reason: string
  actionType: 'LAB_ORDER' | 'IMAGING' | 'MEDICATION_ADJUST'
}

export interface CdsAdviceDto {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN'
  summary: string
  warnings: CdsWarning[]
  suggestions: CdsSuggestion[]
  differentialDiagnoses: string[]
  aiReasoning: string
}

export interface ClinicalEarlyWarningDto {
  news2Score: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  monitoringFrequency: string
  warnings: Array<{
    vitalType: string
    value: string
    pointsContributed: number
    trend: 'STABLE' | 'WORSENING' | 'IMPROVING'
  }>
  aiClinicalAssessment: string
  escalationProtocol: string
}

export interface MedicationReminderDto {
  id: string
  medicineName: string
  reminderTime: string
  dosage: string
  isActive: boolean
  notes?: string
}

export interface MedicationReminderRequest {
  medicineName: string
  reminderTime: string
  dosage: string
  notes?: string
}

export interface PatientVitalLogDto {
  id?: string
  vitalType: string
  valueNumeric: number
  unit?: string
  recordedAt?: string
  imageUrl?: string
  notes?: string
}

export interface MedicationDosageLogDto {
  id?: string
  medicationReminderId?: string
  medicineName: string
  dosageInstruction?: string
  takenAt?: string
}