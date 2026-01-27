/**
 * 게시글 상세 페이지
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { getBoard, deleteBoard, BoardDetail } from '@/services/boardService'

export function BoardDetailPage() {
  const { t, i18n } = useTranslation(['board', 'common', 'auth'])
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isGuest, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const [board, setBoard] = useState<BoardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchBoard = async () => {
      try {
        setLoading(true)
        const data = await getBoard(Number(id))
        setBoard(data)
      } catch (err) {
        setError(t('common:error'))
        console.error('Failed to fetch board:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBoard()
  }, [id, t])

  // 삭제 처리
  const handleDelete = async () => {
    if (!board || !window.confirm(t('board:deleteConfirm'))) return

    try {
      await deleteBoard(board.id)
      alert(t('board:deleteSuccess'))
      navigate('/board')
    } catch (err) {
      alert(t('common:error'))
      console.error('Failed to delete board:', err)
    }
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
        }}
      >
        {t('common:loading')}
      </div>
    )
  }

  if (error || !board) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: 'var(--text-tertiary)',
        }}
      >
        <p>{error || t('common:noData')}</p>
        <button
          onClick={() => navigate('/board')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          {t('board:backToList')}
        </button>
      </div>
    )
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
        <button
          onClick={() => navigate('/board')}
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
          {t('board:backToList')}
        </button>

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

      {/* 게시글 본문 */}
      <article
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)',
          padding: '32px',
        }}
      >
        {/* 제목 */}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 16px 0',
            lineHeight: '1.4',
          }}
        >
          {board.title}
        </h1>

        {/* 메타 정보 */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '24px',
            fontSize: '13px',
            color: 'var(--text-tertiary)',
          }}
        >
          <span>
            {t('board:author')}: <strong style={{ color: 'var(--text-secondary)' }}>{board.author_name}</strong>
          </span>
          <span>{formatDate(board.created_at)}</span>
          <span>
            {t('board:viewCount')}: {board.view_count}
          </span>
        </div>

        {/* 내용 */}
        <div
          style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: '200px',
          }}
        >
          {board.content}
        </div>

        {/* 작성자 액션 버튼 */}
        {board.is_author && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginTop: '32px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <button
              onClick={() => navigate(`/board/edit/${board.id}`)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {t('common:edit')}
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--color-error)',
                backgroundColor: 'transparent',
                color: 'var(--color-error)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {t('common:delete')}
            </button>
          </div>
        )}
      </article>
    </div>
  )
}
