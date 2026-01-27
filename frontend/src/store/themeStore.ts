/**
 * 테마 상태 관리 스토어 (Zustand)
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

// 테마를 DOM에 적용
const applyTheme = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // 초기 상태: 시스템 테마 또는 저장된 테마
      theme: 'light',

      // 테마 설정
      setTheme: (theme: Theme) => {
        applyTheme(theme)
        set({ theme })
      },

      // 테마 토글
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        applyTheme(newTheme)
        set({ theme: newTheme })
      },
    }),
    {
      name: 'theme-storage',
      // hydration 시 테마 적용
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

// 초기 로드 시 저장된 테마 또는 시스템 테마 적용 (FOUC 방지)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      applyTheme(parsed.state?.theme || getSystemTheme())
    } catch {
      applyTheme(getSystemTheme())
    }
  } else {
    applyTheme(getSystemTheme())
  }
}
