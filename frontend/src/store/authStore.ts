/**
 * 인증 상태 관리 스토어 (Zustand)
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth'

interface AuthState {
  // 상태
  user: User | null
  isAuthenticated: boolean
  isGuest: boolean

  // 액션
  setUser: (user: User) => void
  setGuest: (isGuest: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      isGuest: false,

      // 사용자 설정 (로그인 성공 시)
      setUser: (user: User) =>
        set({
          user,
          isAuthenticated: true,
          isGuest: false,
        }),

      // 비회원 모드 설정
      setGuest: (isGuest: boolean) =>
        set({
          isGuest,
          isAuthenticated: false,
          user: null,
        }),

      // 로그아웃
      logout: () => {
        localStorage.removeItem('access_token')
        set({
          user: null,
          isAuthenticated: false,
          isGuest: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),
    }
  )
)
