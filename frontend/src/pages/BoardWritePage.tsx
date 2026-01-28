/**
 * 게시글 작성/수정 페이지
 */
import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useAuthStore } from '@/store/authStore'
import { createBoard, updateBoard, getBoard } from '@/services/boardService'
import { AppLayout } from '@/components/layout/AppLayout'

const TITLE_MAX = 200
const CONTENT_MAX = 10000

export function BoardWritePage() {
  const { t } = useTranslation(['board', 'common', 'auth'])
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

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
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.disabled">{t('common:loading')}</Typography>
      </Box>
    )
  }

  return (
    <AppLayout title={isEditMode ? t('board:editPost') : t('board:write')}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={1}
        sx={{ p: 3, borderRadius: 3 }}
      >
        {/* 제목 입력 */}
        <TextField
          fullWidth
          variant="outlined"
          label={t('board:title')}
          placeholder={t('board:titlePlaceholder')}
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= TITLE_MAX) {
              setTitle(e.target.value)
            }
          }}
          disabled={loading}
          helperText={t('board:charCount', { current: title.length, max: TITLE_MAX })}
          slotProps={{
            formHelperText: {
              sx: { color: title.length > TITLE_MAX ? 'error.main' : 'text.disabled', textAlign: 'right' },
            },
          }}
          sx={{ mb: 2 }}
        />

        {/* 내용 입력 */}
        <TextField
          fullWidth
          variant="outlined"
          label={t('board:content')}
          placeholder={t('board:contentPlaceholder')}
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= CONTENT_MAX) {
              setContent(e.target.value)
            }
          }}
          disabled={loading}
          multiline
          minRows={15}
          helperText={t('board:charCount', { current: content.length, max: CONTENT_MAX })}
          slotProps={{
            formHelperText: {
              sx: { color: content.length > CONTENT_MAX ? 'error.main' : 'text.disabled', textAlign: 'right' },
            },
          }}
          sx={{ mb: 3 }}
        />

        {/* 버튼 영역 */}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            disabled={loading}
            sx={{ borderColor: 'custom.borderColor', color: 'text.secondary' }}
          >
            {t('common:cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? t('common:loading') : t('common:save')}
          </Button>
        </Stack>
      </Paper>
    </AppLayout>
  )
}
