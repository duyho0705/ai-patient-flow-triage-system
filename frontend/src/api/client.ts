const API_BASE = '/api'
const TOKEN_KEY = 'patient-flow-token'

export type TenantHeaders = {
  tenantId: string
  branchId?: string
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function headers(tenant: TenantHeaders | null, body?: unknown): HeadersInit {
  const h: Record<string, string> = {
    Accept: 'application/json',
  }
  if (!(body instanceof FormData)) {
    h['Content-Type'] = 'application/json'
  }
  const token = getStoredToken()
  if (token) h['Authorization'] = `Bearer ${token}`
  if (tenant?.tenantId) {
    h['X-Tenant-Id'] = tenant.tenantId
    if (tenant.branchId) h['X-Branch-Id'] = tenant.branchId
  }
  return h
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export async function api<T>(
  path: string,
  options: RequestInit & { tenant?: TenantHeaders | null } = {}
): Promise<T> {
  const { tenant, ...init } = options
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    ...init,
    credentials: 'include', // Support HttpOnly cookies
    headers: { ...headers(tenant ?? null, init.body), ...(init.headers as Record<string, string>) },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    const error: any = new Error(err.message || err.error || res.statusText)
    error.details = err
    throw error
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T

  const json = JSON.parse(text)

  // If it's an Enterprise ApiResponse, unwrap the data
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    const apiRes = json as ApiResponse<T>
    if (!apiRes.success) {
      throw new Error(apiRes.message || 'API Error')
    }
    return apiRes.data
  }

  return json as T
}

export const get = <T>(path: string, tenant?: TenantHeaders | null) =>
  api<T>(path, { method: 'GET', tenant })

export const post = <T>(path: string, body?: unknown, tenant?: TenantHeaders | null) =>
  api<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    tenant
  })

export const put = <T>(path: string, body: unknown, tenant?: TenantHeaders | null) =>
  api<T>(path, {
    method: 'PUT',
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    tenant
  })

export const patch = <T>(path: string, body?: unknown, tenant?: TenantHeaders | null) =>
  api<T>(path, {
    method: 'PATCH',
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    tenant
  })

export const del = <T>(path: string, tenant?: TenantHeaders | null) =>
  api<T>(path, { method: 'DELETE', tenant })

export async function downloadFile(path: string, tenant: TenantHeaders | null, filename: string) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: headers(tenant),
  })
  if (!res.ok) throw new Error('Download failed')
  const blob = await res.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
