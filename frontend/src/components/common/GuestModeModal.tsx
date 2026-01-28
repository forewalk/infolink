/**
 * 비회원 모드 안내 모달
 */
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

interface GuestModeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function GuestModeModal({ isOpen, onClose, onConfirm }: GuestModeModalProps) {
  const { t } = useTranslation(['auth', 'common'])

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
        {t('auth:guestModeTitle')}
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', lineHeight: 1.5, whiteSpace: 'pre-line' }}
        >
          {t('auth:guestModeWarning')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{ borderColor: 'custom.borderColor', color: 'text.secondary' }}
        >
          {t('common:cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="secondary" fullWidth>
          {t('common:confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
