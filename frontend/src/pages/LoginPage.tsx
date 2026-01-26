/**
 * 로그인 페이지
 * 피그마 디자인 기반 (375x812 모바일 우선)
 */
import { useState, useCallback, FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { GuestModeModal } from '@/components/common/GuestModeModal'

export function LoginPage() {
  const { login, enterGuestMode } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.')
        return
      }

      setIsLoading(true)
      const result = await login({ email, password })
      setIsLoading(false)

      if (!result.success && result.error) {
        alert(result.error.message)
      }
    },
    [email, password, login]
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
        backgroundColor: '#FAFAFA',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 24px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
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
          color: '#1A1A1A',
          margin: '0 0 8px 0',
          zIndex: 1,
        }}
      >
        Infolink
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: '#666666',
          margin: '0 0 40px 0',
          zIndex: 1,
        }}
      >
        상품 정보를 한눈에
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
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#F0F0F0',
              fontSize: '16px',
              color: '#1A1A1A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#F0F0F0',
              fontSize: '16px',
              color: '#1A1A1A',
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
            backgroundColor: isLoading ? '#CCCCCC' : '#4CAF50',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
          }}
        >
          {isLoading ? '로그인 중...' : '로그인'}
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
            color: '#999999',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          비회원으로 둘러보기
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
