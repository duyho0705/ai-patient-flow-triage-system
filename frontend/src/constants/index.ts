/**
 * Enterprise Constants for CDM Platform
 */

export const APP_ROLES = {
    PATIENT: 'PATIENT',
    DOCTOR: 'DOCTOR',
    CLINIC_MANAGER: 'CLINIC_MANAGER',
    ADMIN: 'ADMIN',
} as const

export const APP_ROUTES = {
    LANDING: '/',
    LOGIN: '/login',
    PATIENT_DASHBOARD: '/patient',
    STAFF_DASHBOARD: '/dashboard',
    ACCESS_DENIED: '/403',
} as const

export const ERROR_CODES = {
    AUTH_BAD_CREDENTIALS: 'A001',
    AUTH_SOCIAL_LOGIN_FAILED: 'A002',
    AUTH_TENANT_REQUIRED: 'A003',
    AUTH_USER_NOT_FOUND: 'A004',
    AUTH_USER_DISABLED: 'A005',
} as const

export type AppRole = typeof APP_ROLES[keyof typeof APP_ROLES]
