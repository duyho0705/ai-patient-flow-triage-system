import { post, get, setStoredToken } from './client'
import type { LoginRequest, LoginResponse, AuthUserDto } from '@/types/api'

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const res = await post<LoginResponse>('/auth/login', request)
  if (res.token) setStoredToken(res.token)
  return res
}

export async function me(): Promise<AuthUserDto> {
  return get<AuthUserDto>('/auth/me')
}

export function logout() {
  setStoredToken(null)
}
