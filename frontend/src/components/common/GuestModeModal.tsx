/**
 * 비회원 모드 안내 모달
 */
import { useCallback } from 'react'

interface GuestModeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function GuestModeModal({ isOpen, onClose, onConfirm }: GuestModeModalProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

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
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '320px',
          width: '90%',
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1A1A1A',
          }}
        >
          비회원 이용 안내
        </h3>
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.5',
          }}
        >
          비회원으로 이용 시 일부 기능이 제한됩니다.
          <br />
          전체 기능을 이용하려면 로그인해주세요.
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
              border: '1px solid #CCCCCC',
              backgroundColor: '#fff',
              color: '#666666',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
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
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
