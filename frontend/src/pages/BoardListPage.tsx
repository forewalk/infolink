/**
 * 게시판 목록 페이지 - 카드형 레이아웃
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { getBoards, BoardListItem } from '@/services/boardService'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'

export function BoardListPage() {
  const { t, i18n } = useTranslation(['board', 'common', 'auth'])
  const navigate = useNavigate()
  const { isAuthenticated, isGuest, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const [boards, setBoards] = useState<BoardListItem[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false)

  // 게시글 목록 조회
  const fetchBoards = useCallback(async (cursor?: number) => {
    try {
      setLoading(true)
      const data = await getBoards(cursor)
      if (cursor) {
        setBoards((prev) => [...prev, ...data.items])
      } else {
        setBoards(data.items)
      }
      setNextCursor(data.next_cursor)
      setHasMore(data.has_more)
    } catch (error) {
      console.error('Failed to fetch boards:', error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  // 더 보기
  const loadMore = () => {
    if (nextCursor && !loading) {
      fetchBoards(nextCursor)
    }
  }

  // 글쓰기 버튼 클릭
  const handleWrite = () => {
    if (!isAuthenticated) {
      setShowLoginRequiredModal(true)
      return
    }
    navigate('/board/write')
  }

  // 언어 변경
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // 내용 미리보기 (HTML 태그 제거 후 최대 100자)
  const getPreview = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '')
    return text.length > 100 ? text.slice(0, 100) + '...' : text
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
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
            }}
          >
            ←
          </button>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {t('board:board')}
          </h1>
        </div>

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
            {theme === 'light' ? '🌙' : '☀️'}
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

      {/* 글쓰기 버튼 */}
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <button
          onClick={handleWrite}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          {t('board:write')}
        </button>
      </div>

      {/* 게시글 카드 목록 */}
      {initialLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          {t('common:loading')}
        </div>
      ) : boards.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          {t('board:noBoards')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '16px 20px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'box-shadow 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* 제목 */}
              <h3
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {board.title}
              </h3>

              {/* 내용 미리보기 */}
              <p
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {getPreview(board.content)}
              </p>

              {/* 메타 정보 */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                }}
              >
                <span>{board.author_name}</span>
                <span>{formatDate(board.created_at)}</span>
                <span>{t('board:viewCount')} {board.view_count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? t('common:loading') : t('board:loadMore')}
          </button>
        </div>
      )}

      {/* 비회원 글쓰기 거부 모달 */}
      <LoginRequiredModal
        isOpen={showLoginRequiredModal}
        onClose={() => setShowLoginRequiredModal(false)}
      />
    </div>
  )
}
