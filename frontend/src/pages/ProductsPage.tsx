/**
 * 상품 페이지 (Placeholder)
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'

export function ProductsPage() {
  const { t, i18n } = useTranslation(['common', 'auth', 'board'])
  const { user, isGuest } = useAuthStore()
  const navigate = useNavigate()

  return (
    <AppLayout title={t('common:appName')}>
      {/* 사용자 정보 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        {isGuest ? (
          <Typography variant="body2" color="text.secondary">
            {t('auth:guestModeDesc')}
          </Typography>
        ) : user ? (
          <Typography variant="body2" color="text.primary">
            <strong>{user.username}</strong>
            {i18n.language === 'ko' ? '님, 환영합니다!' : ', welcome!'}
          </Typography>
        ) : null}
      </Paper>

      {/* 상품 목록 (Placeholder) */}
      <Paper elevation={1} sx={{ p: 5, mb: 3, borderRadius: 3, textAlign: 'center' }}>
        <Typography color="text.disabled">{t('common:noData')}</Typography>
      </Paper>

      {/* 게시판 이동 버튼 */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/board')}
          sx={{ px: 4, py: 1.5, borderRadius: 3, fontSize: 16, fontWeight: 500 }}
        >
          {t('board:goToBoard')}
        </Button>
      </Box>
    </AppLayout>
  )
}
