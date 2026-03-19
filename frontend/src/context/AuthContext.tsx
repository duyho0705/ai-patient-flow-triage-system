import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { getStoredToken, setStoredToken } from '@/api/client'
import { AuthService, OpenAPI } from '@/api-client'
import type { AuthUserDto, LoginRequest, LoginResponse } from '@/api-client'

// Configure OpenAPI globally
OpenAPI.BASE = 'http://localhost:8080'

type AuthContextValue = {
  user: AuthUserDto | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (req: LoginRequest) => Promise<LoginResponse>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const mapRole = (r: string): string => {
  const role = r.toLowerCase()
  if (role === 'system_admin') return 'admin'
  return role
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUserDto | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState(true)

  const setUser = useCallback((u: AuthUserDto | null) => {
    if (!u) {
      setUserState(null)
      return
    }
    const normalizedUser = {
      ...u,
      roles: (u.roles || []).map(mapRole),
    }
    setUserState(normalizedUser)
  }, [])

  const refreshUser = useCallback(async () => {
    const t = getStoredToken()
    if (!t) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return
    }
    // Set token globally for OpenAPI
    OpenAPI.TOKEN = t
    try {
      const res = await AuthService.me()
      if (res.success && res.data) {
        setUser(res.data)
        setToken(t)
      } else {
        throw new Error("Failed to get user")
      }
    } catch (err: any) {
      console.error('Failed to refresh user:', err)
      const errStatus = err?.status || err?.body?.status || err?.errorCode
      if (errStatus === 401 || errStatus === 'UNAUTHORIZED' || err?.message?.includes('401')) {
        AuthService.logout().catch(() => {})
        setStoredToken(null)
        OpenAPI.TOKEN = undefined
        setUser(null)
        setToken(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [setUser])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(
    async (req: LoginRequest) => {
      const apiRes = await AuthService.login(req)
      const res = apiRes.data!
      setStoredToken(res.token!)
      setToken(res.token!)
      OpenAPI.TOKEN = res.token!
      setUser(res.user!)
      return res
    },
    [setUser]
  )



  const logout = useCallback(() => {
    AuthService.logout().catch(() => {})
    setStoredToken(null)
    OpenAPI.TOKEN = undefined
    setToken(null)
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
