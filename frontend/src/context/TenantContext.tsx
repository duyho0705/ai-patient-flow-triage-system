import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { TenantHeaders } from '@/api/client'

type TenantContextValue = {
  tenantId: string | null
  branchId: string | null
  setTenant: (tenantId: string | null, branchId?: string | null) => void
  headers: TenantHeaders | null
}

const TenantContext = createContext<TenantContextValue | null>(null)

const STORAGE_KEY = 'patient-flow-tenant'

function loadStored(): { tenantId: string | null; branchId: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const { tenantId, branchId } = JSON.parse(raw)
      return { tenantId: tenantId || null, branchId: branchId || null }
    }
  } catch {
    // ignore
  }
  return { tenantId: null, branchId: null }
}

function save(tenantId: string | null, branchId: string | null) {
  if (tenantId) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tenantId, branchId: branchId || null }))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(loadStored)

  const setTenant = useCallback((tenantId: string | null, branchId?: string | null) => {
    const branch = branchId ?? null
    setStored({ tenantId, branchId: branch })
    save(tenantId, branch)
  }, [])

  const headers: TenantHeaders | null =
    stored.tenantId ? { tenantId: stored.tenantId, branchId: stored.branchId ?? undefined } : null

  return (
    <TenantContext.Provider value={{ ...stored, setTenant, headers }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantProvider')
  return ctx
}
