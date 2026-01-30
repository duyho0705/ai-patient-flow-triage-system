const API_BASE = '/api'

export type TenantHeaders = {
  tenantId: string
  branchId?: string
}

function headers(tenant: TenantHeaders | null): HeadersInit {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (tenant?.tenantId) {
    h['X-Tenant-Id'] = tenant.tenantId
    if (tenant.branchId) h['X-Branch-Id'] = tenant.branchId
  }
  return h
}

export async function api<T>(
  path: string,
  options: RequestInit & { tenant?: TenantHeaders | null } = {}
): Promise<T> {
  const { tenant, ...init } = options
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    ...init,
    headers: { ...headers(tenant ?? null), ...(init.headers as Record<string, string>) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || err.error || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const get = <T>(path: string, tenant?: TenantHeaders | null) =>
  api<T>(path, { method: 'GET', tenant })

export const post = <T>(path: string, body?: unknown, tenant?: TenantHeaders | null) =>
  api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, tenant })

export const put = <T>(path: string, body: unknown, tenant?: TenantHeaders | null) =>
  api<T>(path, { method: 'PUT', body: JSON.stringify(body), tenant })

export const patch = <T>(path: string, body?: unknown, tenant?: TenantHeaders | null) =>
  api<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, tenant })
