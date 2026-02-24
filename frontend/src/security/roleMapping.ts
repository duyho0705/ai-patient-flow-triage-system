import type { Role } from '@/context/RoleContext'

const STAFF_ROLE_PRIORITY: Role[] = ['admin', 'clinic_manager', 'doctor', 'receptionist', 'triage_nurse', 'pharmacist']

/**
 * Kiểm tra xem user có ít nhất một role trong danh sách allowedRoles hay không.
 * Giả định backend trả về role code trùng với Role (admin, doctor, ...).
 */
export function hasAnyRole(userRoles: string[] | undefined | null, allowedRoles: Role[]): boolean {
  if (!userRoles || userRoles.length === 0) return false
  return userRoles.some((r) => allowedRoles.includes(r as Role))
}

/**
 * Lấy role "chính" của staff (dùng cho hiển thị Dashboard/config theo vai trò).
 * User có thể có nhiều role; ưu tiên theo thứ tự: admin > clinic_manager > doctor > receptionist > triage_nurse > pharmacist.
 */
export function getPrimaryStaffRole(userRoles: string[] | undefined | null): Role {
  if (!userRoles || userRoles.length === 0) return 'receptionist'
  for (const r of STAFF_ROLE_PRIORITY) {
    if (userRoles.includes(r)) return r
  }
  return 'receptionist'
}

