/**
 * 인증 API 서비스
 */
import api from '@/services/api'
import type { LoginRequest, LoginResponse, User, AuthError, AuthErrorType } from '@/types/auth'
import { AxiosError } from 'axios'

/**
 * 로그인 API 호출
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', credentials)
  return response.data
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/auth/me')
  return response.data
}

/**
 * API 에러를 AuthError로 변환
 */
export function parseError(error: unknown): AuthError {
  if (error instanceof AxiosError) {
    // 네트워크 에러 (서버 연결 불가)
    if (!error.response) {
      return {
        type: 'network',
        message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
      }
    }

    // 401: 인증 실패
    if (error.response.status === 401) {
      return {
        type: 'credentials',
        message: error.response.data?.detail || '이메일 또는 비밀번호가 올바르지 않습니다.',
      }
    }

    // 422: 유효성 검사 실패
    if (error.response.status === 422) {
      return {
        type: 'credentials',
        message: '입력 형식이 올바르지 않습니다.',
      }
    }

    // 기타 서버 에러
    return {
      type: 'unknown',
      message: error.response.data?.detail || '알 수 없는 오류가 발생했습니다.',
    }
  }

  // 기타 에러
  return {
    type: 'unknown',
    message: '알 수 없는 오류가 발생했습니다.',
  }
}
