/**
 * 게시글 상세 페이지
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { getBoard, deleteBoard, BoardDetail } from '@/services/boardService'
import { AppLayout } from '@/components/layout/AppLayout'

export function BoardDetailPage() {
  const { t, i18n } = useTranslation(['board', 'common', 'auth'])
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

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

  if (error || !board) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Typography color="text.disabled">{error || t('common:noData')}</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/board')}
          sx={{ borderColor: 'custom.borderColor', color: 'text.secondary' }}
        >
          {t('board:backToList')}
        </Button>
      </Box>
    )
  }

  return (
    <AppLayout title={t('board:board')} showBack backTo="/board">
      <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
        {/* 제목 */}
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2, lineHeight: 1.4 }}>
          {board.title}
        </Typography>

        {/* 메타 정보 */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ pb: 2, mb: 3 }}
        >
          <Typography variant="caption" color="text.disabled">
            {t('board:author')}:{' '}
            <Typography component="span" variant="caption" color="text.secondary" fontWeight={600}>
              {board.author_name}
            </Typography>
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {formatDate(board.created_at)}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {t('board:viewCount')}: {board.view_count}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* 내용 */}
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: 200,
          }}
        >
          {board.content}
        </Typography>

        {/* 작성자 액션 버튼 */}
        {board.is_author && (
          <>
            <Divider sx={{ mt: 4, mb: 2 }} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/board/edit/${board.id}`)}
                sx={{ borderColor: 'custom.borderColor', color: 'text.secondary' }}
              >
                {t('common:edit')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                {t('common:delete')}
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </AppLayout>
  )
}
