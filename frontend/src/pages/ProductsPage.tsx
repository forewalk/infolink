/**
 * 상품 페이지 (Placeholder)
 */
import { useAuth } from '@/hooks/useAuth'

export function ProductsPage() {
  const { user, isGuest, logout } = useAuth()

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAFA',
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
            color: '#1A1A1A',
            margin: 0,
          }}
        >
          상품 목록
        </h1>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #CCCCCC',
            backgroundColor: '#fff',
            color: '#666666',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {isGuest ? '로그인하기' : '로그아웃'}
        </button>
      </header>

      {/* 사용자 정보 */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {isGuest ? (
          <p style={{ margin: 0, color: '#666666', fontSize: '14px' }}>
            비회원으로 이용 중입니다. 로그인하면 더 많은 기능을 사용할 수 있습니다.
          </p>
        ) : user ? (
          <p style={{ margin: 0, color: '#1A1A1A', fontSize: '14px' }}>
            <strong>{user.username}</strong>님, 환영합니다!
          </p>
        ) : null}
      </div>

      {/* 상품 목록 (Placeholder) */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#999999',
            fontSize: '16px',
          }}
        >
          상품 목록이 여기에 표시됩니다.
        </p>
      </div>
    </div>
  )
}
