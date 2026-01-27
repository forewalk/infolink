/**
 * 로그인 페이지
 * 피그마 디자인 기반 (375x812 모바일 우선)
 * 다크모드 + 다국어 지원
 */
import { useState, useCallback, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/store/themeStore'
import { GuestModeModal } from '@/components/common/GuestModeModal'

export function LoginPage() {
  const { t, i18n } = useTranslation(['auth', 'common'])
  const { login, enterGuestMode } = useAuth()
  const { theme, toggleTheme } = useThemeStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!email || !password) {
        alert(t('auth:emailRequired'))
        return
      }

      setIsLoading(true)
      const result = await login({ email, password })
      setIsLoading(false)

      if (!result.success && result.error) {
        alert(result.error.message)
      }
    },
    [email, password, login, t]
  )

  const handleGuestClick = useCallback(() => {
    setShowGuestModal(true)
  }, [])

  const handleGuestConfirm = useCallback(() => {
    setShowGuestModal(false)
    enterGuestMode()
  }, [enterGuestMode])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 24px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 상단 컨트롤: 언어 선택 + 다크모드 토글 */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          zIndex: 2,
        }}
      >
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <option value="ko">한글</option>
          <option value="en">English</option>
        </select>

        <button
          type="button"
          onClick={toggleTheme}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* 장식 원형 요소 */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          left: '-60px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 199, 60, 0.08)',
        }}
      />

      {/* 로고 */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          zIndex: 1,
        }}
      >
        <span
          style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: '700',
          }}
        >
          GN
        </span>
      </div>

      {/* 제목 */}
      <h1
        style={{
          fontSize: '24px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          margin: '0 0 8px 0',
          zIndex: 1,
        }}
      >
        {t('common:appName')}
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          margin: '0 0 40px 0',
          zIndex: 1,
        }}
      >
        {t('auth:appDescription')}
      </p>

      {/* 로그인 폼 */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '327px',
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <input
            type="email"
            placeholder={t('auth:email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--bg-tertiary)',
              fontSize: '16px',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="password"
            placeholder={t('auth:password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--bg-tertiary)',
              fontSize: '16px',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: isLoading ? 'var(--border-color)' : '#4CAF50',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
          }}
        >
          {isLoading ? t('auth:loggingIn') : t('auth:loginButton')}
        </button>

        <button
          type="button"
          onClick={handleGuestClick}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-tertiary)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {t('auth:guestMode')}
        </button>
      </form>

      {/* 비회원 안내 모달 */}
      <GuestModeModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onConfirm={handleGuestConfirm}
      />
    </div>
  )
}
