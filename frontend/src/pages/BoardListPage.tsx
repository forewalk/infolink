/**
 * 게시판 목록 페이지 - MUI 카드형 레이아웃
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { useAuthStore } from '@/store/authStore'
import { getBoards, BoardListItem } from '@/services/boardService'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import { AppLayout } from '@/components/layout/AppLayout'

export function BoardListPage() {
  const { t, i18n } = useTranslation(['board', 'common', 'auth'])
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

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
    <AppLayout title={t('board:board')} showBack backTo="/products">
      {/* 글쓰기 버튼 */}
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" color="primary" onClick={handleWrite}>
          {t('board:write')}
        </Button>
      </Box>

      {/* 게시글 카드 목록 */}
      {initialLoading ? (
        <Typography color="text.disabled" sx={{ py: 5, textAlign: 'center' }}>
          {t('common:loading')}
        </Typography>
      ) : boards.length === 0 ? (
        <Typography color="text.disabled" sx={{ py: 5, textAlign: 'center' }}>
          {t('board:noBoards')}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {boards.map((board) => (
            <Card key={board.id} elevation={1} sx={{ borderRadius: 3 }}>
              <CardActionArea onClick={() => navigate(`/board/${board.id}`)}>
                <CardContent sx={{ px: 2.5, py: 2 }}>
                  {/* 제목 */}
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    noWrap
                    sx={{ mb: 1 }}
                  >
                    {board.title}
                  </Typography>

                  {/* 내용 미리보기 */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {getPreview(board.content)}
                  </Typography>

                  {/* 메타 정보 */}
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption" color="text.disabled">
                      {board.author_name}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDate(board.created_at)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {t('board:viewCount')} {board.view_count}
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}

      {/* 더 보기 버튼 */}
      {hasMore && (
        <Box sx={{ mt: 2.5, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={loading}
            sx={{ borderColor: 'custom.borderColor', color: 'text.secondary' }}
          >
            {loading ? t('common:loading') : t('board:loadMore')}
          </Button>
        </Box>
      )}

      {/* 비회원 글쓰기 거부 모달 */}
      <LoginRequiredModal
        isOpen={showLoginRequiredModal}
        onClose={() => setShowLoginRequiredModal(false)}
      />
    </AppLayout>
  )
}
