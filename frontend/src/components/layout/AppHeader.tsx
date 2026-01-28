/**
 * 공통 앱 헤더 (AppBar + Toolbar)
 */
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { LanguageSelect } from '@/components/common/LanguageSelect'

interface AppHeaderProps {
  title: string
  showBack?: boolean
  backTo?: string
}

export function AppHeader({ title, showBack, backTo }: AppHeaderProps) {
  const { t } = useTranslation(['common', 'auth'])
  const navigate = useNavigate()
  const { isGuest, logout } = useAuthStore()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ px: { xs: 0 }, gap: 1 }}>
        {showBack && (
          <IconButton edge="start" onClick={handleBack} size="small">
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <LanguageSelect />
          <ThemeToggle />
          <Button
            variant="outlined"
            size="small"
            onClick={handleLogout}
            sx={{ borderColor: 'custom.borderColor', color: 'text.secondary', fontSize: 13 }}
          >
            {isGuest ? t('common:goToLogin') : t('auth:logout')}
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
