import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

/** Role chính theo thực tế phòng khám VN */
export type Role = 'admin' | 'receptionist' | 'triage_nurse' | 'doctor' | 'clinic_manager'

const ROLES: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin (Quản trị hệ thống)' },
  { value: 'receptionist', label: 'Lễ tân (Receptionist)' },
  { value: 'triage_nurse', label: 'Y tá phân loại (Triage Nurse)' },
  { value: 'doctor', label: 'Bác sĩ (Doctor)' },
  { value: 'clinic_manager', label: 'Quản lý vận hành (Clinic Manager)' },
]

const STORAGE_KEY = 'patient-flow-role'

const VALID_ROLES: Role[] = ['admin', 'receptionist', 'triage_nurse', 'doctor', 'clinic_manager']

function loadRole(): Role {
  try {
    const r = localStorage.getItem(STORAGE_KEY)
    if (r && VALID_ROLES.includes(r as Role)) return r as Role
  } catch {
    // ignore
  }
  return 'receptionist'
}

type RoleContextValue = {
  role: Role
  setRole: (role: Role) => void
  roleLabel: string
  roles: { value: Role; label: string }[]
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(loadRole)

  const setRole = useCallback((r: Role) => {
    setRoleState(r)
    localStorage.setItem(STORAGE_KEY, r)
  }, [])

  const roleLabel = ROLES.find((x) => x.value === role)?.label ?? role

  return (
    <RoleContext.Provider value={{ role, setRole, roleLabel, roles: ROLES }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
