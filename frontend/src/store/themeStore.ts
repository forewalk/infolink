/**
 * 테마 상태 관리 스토어 (Zustand)
 * MUI ThemeProvider가 테마를 적용하므로 DOM 조작 불필요
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  // 상태
  theme: Theme

  // 액션
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// 시스템 테마 감지
const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // 초기 상태: 시스템 테마 또는 저장된 테마
      theme: getSystemTheme(),

      // 테마 설정
      setTheme: (theme: Theme) => {
        set({ theme })
      },

      // 테마 토글
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
