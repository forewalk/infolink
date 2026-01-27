/**
 * 메인 앱 컴포넌트 - 라우팅 설정
 */
import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoginPage } from '@/pages/LoginPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { BoardListPage } from '@/pages/BoardListPage'
import { BoardDetailPage } from '@/pages/BoardDetailPage'
import { BoardWritePage } from '@/pages/BoardWritePage'

/**
 * 인증된 사용자만 접근 가능한 라우트
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isGuest } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

/**
 * 비로그인 사용자만 접근 가능한 라우트 (로그인 페이지)
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/products" replace />
  }

  return <>{children}</>
}

function App() {
  const { isAuthenticated, user } = useAuthStore()

  // 페이지 로드 시 토큰 유효성 확인
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !isAuthenticated && !user) {
      // 토큰이 있지만 인증되지 않은 상태면 세션 복원 시도
      // useAuth hook의 restoreSession을 통해 처리
    }
  }, [isAuthenticated, user])

  return (
    <Routes>
      {/* 루트: /login으로 리다이렉트 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 로그인 페이지: 비로그인 시만 접근 */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* 상품 페이지: 로그인 또는 비회원 모드 필요 */}
      <Route
        path="/products"
        element={
          <PrivateRoute>
            <ProductsPage />
          </PrivateRoute>
        }
      />

      {/* 게시판: 목록/상세는 게스트 가능, 작성/수정은 인증 필요 */}
      <Route
        path="/board"
        element={
          <PrivateRoute>
            <BoardListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/board/write"
        element={
          <PrivateRoute>
            <BoardWritePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/board/edit/:id"
        element={
          <PrivateRoute>
            <BoardWritePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/board/:id"
        element={
          <PrivateRoute>
            <BoardDetailPage />
          </PrivateRoute>
        }
      />

      {/* 404: 로그인 페이지로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
