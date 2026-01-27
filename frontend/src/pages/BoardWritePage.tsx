/**
 * 게시글 작성/수정 페이지
 */
import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { createBoard, updateBoard, getBoard } from '@/services/boardService'

const TITLE_MAX = 200
const CONTENT_MAX = 10000

export function BoardWritePage() {
  const { t } = useTranslation(['board', 'common', 'auth'])
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const isEditMode = !!id

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode)

  // 로그인 필수 체크
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // 수정 모드: 기존 게시글 불러오기
  useEffect(() => {
    if (!isEditMode || !id) return

    const fetchBoard = async () => {
      try {
        const data = await getBoard(Number(id))
        if (!data.is_author) {
          alert(t('common:error'))
          navigate('/board')
          return
        }
        setTitle(data.title)
        setContent(data.content)
      } catch (err) {
        alert(t('common:error'))
        navigate('/board')
        console.error('Failed to fetch board:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchBoard()
  }, [isEditMode, id, navigate, t])

  // 제출 처리
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      alert(t('board:titleRequired'))
      return
    }
    if (!trimmedContent) {
      alert(t('board:contentRequired'))
      return
    }

    try {
      setLoading(true)

      if (isEditMode && id) {
        await updateBoard(Number(id), { title: trimmedTitle, content: trimmedContent })
        alert(t('board:updateSuccess'))
        navigate(`/board/${id}`)
      } else {
        const created = await createBoard({ title: trimmedTitle, content: trimmedContent })
        alert(t('board:createSuccess'))
        navigate(`/board/${created.id}`)
      }
    } catch (err) {
      alert(t('common:error'))
      console.error('Failed to save board:', err)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
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
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {isEditMode ? t('board:editPost') : t('board:write')}
        </h1>

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
      </header>

      {/* 작성 폼 */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px',
          }}
        >
          {/* 제목 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                }}
              >
                {t('board:title')}
              </label>
              <span
                style={{
                  fontSize: '12px',
                  color: title.length > TITLE_MAX ? 'var(--color-error)' : 'var(--text-tertiary)',
                }}
              >
                {t('board:charCount', { current: title.length, max: TITLE_MAX })}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                if (e.target.value.length <= TITLE_MAX) {
                  setTitle(e.target.value)
                }
              }}
              placeholder={t('board:titlePlaceholder')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 내용 입력 */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                }}
              >
                {t('board:content')}
              </label>
              <span
                style={{
                  fontSize: '12px',
                  color: content.length > CONTENT_MAX ? 'var(--color-error)' : 'var(--text-tertiary)',
                }}
              >
                {t('board:charCount', { current: content.length, max: CONTENT_MAX })}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= CONTENT_MAX) {
                  setContent(e.target.value)
                }
              }}
              placeholder={t('board:contentPlaceholder')}
              disabled={loading}
              rows={15}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '15px',
                lineHeight: '1.6',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                minHeight: '300px',
              }}
            />
          </div>

          {/* 버튼 영역 */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {t('common:cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: loading ? 'var(--border-color)' : 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? t('common:loading') : t('common:save')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
