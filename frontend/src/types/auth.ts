/**
 * 인증 관련 타입 정의
 */

// 사용자 타입
export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

// 로그인 요청
export interface LoginRequest {
  email: string
  password: string
}

// 로그인 응답
export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

// 에러 타입
export type AuthErrorType = 'credentials' | 'network' | 'unknown'

export interface AuthError {
  type: AuthErrorType
  message: string
}
