/**
 * 상품 페이지 (Placeholder)
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/store/themeStore'

export function ProductsPage() {
  const { t, i18n } = useTranslation(['common', 'auth', 'board'])
  const { user, isGuest, logout } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  // 언어 변경
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '24px',
      }}
    >
      {/* 헤더 */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {t('common:appName')}
        </h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 언어 선택 */}
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

          {/* 다크모드 토글 */}
          <button
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
            {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
          </button>

          {/* 로그아웃 버튼 */}
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {isGuest ? t('common:goToLogin') : t('auth:logout')}
          </button>
        </div>
      </header>

      {/* 사용자 정보 */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {isGuest ? (
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            {t('auth:guestModeDesc')}
          </p>
        ) : user ? (
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '14px' }}>
            <strong>{user.username}</strong>{i18n.language === 'ko' ? '님, 환영합니다!' : ', welcome!'}
          </p>
        ) : null}
      </div>

      {/* 상품 목록 (Placeholder) */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
        }}
      >
        <p
          style={{
            margin: 0,
            color: 'var(--text-tertiary)',
            fontSize: '16px',
          }}
        >
          {t('common:noData')}
        </p>
      </div>

      {/* 게시판 이동 버튼 */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => navigate('/board')}
          style={{
            padding: '14px 32px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          {t('board:goToBoard')}
        </button>
      </div>
    </div>
  )
}
