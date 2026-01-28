/**
 * 로그인 필요 안내 모달 (비회원 글쓰기 시 거부 팝업)
 */
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'

interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  const { t } = useTranslation(['auth', 'board', 'common'])
  const navigate = useNavigate()

  const handleGoToLogin = useCallback(() => {
    onClose()
    navigate('/login')
  }, [onClose, navigate])

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, pr: 5 }}>
        {t('auth:loginRequired')}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', lineHeight: 1.5, whiteSpace: 'pre-line' }}
        >
          {t('board:writeLoginRequired')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{ borderColor: 'custom.borderColor', color: 'text.secondary' }}
        >
          {t('auth:maybeLater')}
        </Button>
        <Button onClick={handleGoToLogin} variant="contained" color="secondary" fullWidth>
          {t('common:goToLogin')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
