import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { getStoredToken } from '@/api/client'
import * as authApi from '@/api/auth'
import type { AuthUserDto, LoginRequest, RegisterRequest, LoginResponse, SocialLoginRequest } from '@/types/api'

type AuthContextValue = {
  user: AuthUserDto | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (req: LoginRequest) => Promise<LoginResponse>
  socialLogin: (req: SocialLoginRequest) => Promise<LoginResponse>
  register: (req: RegisterRequest) => Promise<LoginResponse>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const t = getStoredToken()
    if (!t) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return
    }
    try {
      const u = await authApi.me()
      setUser(u)
      setToken(t)
    } catch {
      authApi.logout()
      setUser(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(
    async (req: LoginRequest) => {
      const res = await authApi.login(req)
      setToken(res.token)
      setUser(res.user)
      return res
    },
    []
  )

  const socialLogin = useCallback(
    async (req: SocialLoginRequest) => {
      const res = await authApi.socialLogin(req)
      setToken(res.token)
      setUser(res.user)
      return res
    },
    []
  )

  const register = useCallback(
    async (req: RegisterRequest) => {
      const res = await authApi.register(req)
      setToken(res.token)
      setUser(res.user)
      return res
    },
    []
  )

  const logout = useCallback(() => {
    authApi.logout()
    setToken(null)
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    socialLogin,
    register,
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
