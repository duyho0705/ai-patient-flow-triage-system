const API_BASE = '/api'
const TOKEN_KEY = 'cdm-platform-token'
const TENANT_KEY = 'cdm-platform-tenant'

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

export function getStoredTenant(): TenantHeaders | null {
  try {
    const raw = localStorage.getItem(TENANT_KEY)
    if (raw) {
      const { tenantId, branchId } = JSON.parse(raw)
      if (tenantId) return { tenantId, branchId: branchId || undefined }
    }
  } catch {
    return null
  }
  return null
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

  // Use provided tenant or fallback to stored one
  const targetTenant = tenant || getStoredTenant()
  if (targetTenant?.tenantId) {
    h['X-Tenant-Id'] = targetTenant.tenantId
    if (targetTenant.branchId) h['X-Branch-Id'] = targetTenant.branchId
  }
  return h
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function silentRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const resp = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!resp.ok) throw new Error('Refresh failed')
      const json = await resp.json()
      // Unwrap enterprise ApiResponse if needed
      const data = json.data || json
      const token = data.token
      if (token) setStoredToken(token)
      return token
    } catch (err) {
      console.error('Silent refresh failed:', err)
      setStoredToken(null)
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
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
    if (res.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      const isRetry = (options as any)._retry
      if (!isRetry) {
        // Try silent refresh
        const newToken = await silentRefresh()
        if (newToken) {
          // Retry original request with new token
          return api(path, { ...options, _retry: true, headers: { ...options.headers, 'Authorization': `Bearer ${newToken}` } } as any)
        }
      }
    }

    const err = await res.json().catch(() => ({ message: res.statusText }))
    const errorMessage = err.message || err.error || res.statusText
    const error: any = new Error(errorMessage)
    error.details = err
    if (err.data?.errorCode) {
      error.errorCode = err.data.errorCode
    } else if (err.errorCode) {
      error.errorCode = err.errorCode
    }
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
      const err: any = new Error(apiRes.message || 'API Error')
      err.data = apiRes.data
      if ((apiRes.data as any)?.errorCode) {
        err.errorCode = (apiRes.data as any).errorCode
      }
      throw err
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

