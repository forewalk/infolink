/**
 * 인증 관련 커스텀 훅
 */
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import * as authService from '@/services/authService'
import type { LoginRequest, AuthError } from '@/types/auth'

interface UseAuthReturn {
  // 상태
  user: ReturnType<typeof useAuthStore>['user']
  isAuthenticated: boolean
  isGuest: boolean

  // 액션
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: AuthError }>
  logout: () => void
  enterGuestMode: () => void
  restoreSession: () => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const { user, isAuthenticated, isGuest, setUser, setGuest, logout: storeLogout } = useAuthStore()

  /**
   * 로그인
   */
  const login = useCallback(
    async (credentials: LoginRequest): Promise<{ success: boolean; error?: AuthError }> => {
      try {
        const response = await authService.login(credentials)

        // 토큰 저장
        localStorage.setItem('access_token', response.access_token)

        // 스토어 업데이트
        setUser(response.user)

        // 상품 페이지로 이동
        navigate('/products')

        return { success: true }
      } catch (error) {
        const authError = authService.parseError(error)
        return { success: false, error: authError }
      }
    },
    [navigate, setUser]
  )

  /**
   * 로그아웃
   */
  const logout = useCallback(() => {
    storeLogout()
    navigate('/login')
  }, [navigate, storeLogout])

  /**
   * 비회원 모드 진입
   */
  const enterGuestMode = useCallback(() => {
    setGuest(true)
    navigate('/products')
  }, [navigate, setGuest])

  /**
   * 세션 복원 (새로고침 시)
   */
  const restoreSession = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      return false
    }

    try {
      const user = await authService.getCurrentUser()
      setUser(user)
      return true
    } catch {
      // 토큰이 유효하지 않으면 삭제
      localStorage.removeItem('access_token')
      storeLogout()
      return false
    }
  }, [setUser, storeLogout])

  return {
    user,
    isAuthenticated,
    isGuest,
    login,
    logout,
    enterGuestMode,
    restoreSession,
  }
}
