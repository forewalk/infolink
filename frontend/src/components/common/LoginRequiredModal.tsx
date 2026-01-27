/**
 * 로그인 필요 안내 모달 (비회원 글쓰기 시 거부 팝업)
 * reject.svg 디자인 기반
 */
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  const { t } = useTranslation(['auth', 'board'])
  const navigate = useNavigate()

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  const handleGoToLogin = useCallback(() => {
    onClose()
    navigate('/login')
  }, [onClose, navigate])

  if (!isOpen) return null

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '320px',
          width: '90%',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* X 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <h3
          style={{
            margin: '8px 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}
        >
          {t('auth:loginRequired')}
        </h3>
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            whiteSpace: 'pre-line',
          }}
        >
          {t('board:writeLoginRequired')}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {t('auth:maybeLater')}
          </button>
          <button
            onClick={handleGoToLogin}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4CAF50',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {t('common:goToLogin')}
          </button>
        </div>
      </div>
    </div>
  )
}
