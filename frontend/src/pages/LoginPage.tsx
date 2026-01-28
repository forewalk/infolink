/**
 * 로그인 페이지
 * MUI 컴포넌트 기반, 다크모드 + 다국어 지원
 */
import { useState, useCallback, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useAuth } from '@/hooks/useAuth'
import logoImg from '@/images/logo.png'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { LanguageSelect } from '@/components/common/LanguageSelect'
import { GuestModeModal } from '@/components/common/GuestModeModal'

export function LoginPage() {
  const { t } = useTranslation(['auth', 'common'])
  const { login, enterGuestMode } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!email || !password) {
        alert(t('auth:emailRequired'))
        return
      }

      setIsLoading(true)
      const result = await login({ email, password })
      setIsLoading(false)

      if (!result.success && result.error) {
        alert(result.error.message)
      }
    },
    [email, password, login, t]
  )

  const handleGuestClick = useCallback(() => {
    setShowGuestModal(true)
  }, [])

  const handleGuestConfirm = useCallback(() => {
    setShowGuestModal(false)
    enterGuestMode()
  }, [enterGuestMode])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 상단 컨트롤: 언어 선택 + 다크모드 토글 */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}
      >
        <LanguageSelect />
        <ThemeToggle />
      </Stack>

      {/* 장식 원형 요소 */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          left: -60,
          width: 180,
          height: 180,
          borderRadius: '50%',
          bgcolor: 'rgba(76, 175, 80, 0.1)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: 'rgba(0, 199, 60, 0.08)',
        }}
      />

      {/* 로고 */}
      <Avatar
        src={logoImg}
        alt="Goodnak"
        sx={{
          width: 80,
          height: 80,
          mb: 3,
          zIndex: 1,
        }}
      />

      {/* 제목 */}
      <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 1, zIndex: 1 }}>
        {t('common:appName')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 5, zIndex: 1 }}>
        {t('auth:appDescription')}
      </Typography>

      {/* 로그인 폼 */}
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 327, zIndex: 1 }}>
        <TextField
          type="email"
          placeholder={t('auth:email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          fullWidth
          variant="filled"
          slotProps={{ input: { disableUnderline: true } }}
          sx={{
            mb: 2,
            '& .MuiFilledInput-root': {
              borderRadius: '12px',
              bgcolor: 'custom.bgTertiary',
              py: 0,
            },
            '& .MuiFilledInput-input': {
              py: '16px',
              fontSize: 16,
            },
          }}
        />

        <TextField
          type="password"
          placeholder={t('auth:password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          fullWidth
          variant="filled"
          slotProps={{ input: { disableUnderline: true } }}
          sx={{
            mb: 3,
            '& .MuiFilledInput-root': {
              borderRadius: '12px',
              bgcolor: 'custom.bgTertiary',
              py: 0,
            },
            '& .MuiFilledInput-input': {
              py: '16px',
              fontSize: 16,
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          disabled={isLoading}
          sx={{ py: 1.5, borderRadius: '12px', fontWeight: 600, fontSize: 16, mb: 2 }}
        >
          {isLoading ? t('auth:loggingIn') : t('auth:loginButton')}
        </Button>

        <Button
          type="button"
          onClick={handleGuestClick}
          disabled={isLoading}
          fullWidth
          sx={{ color: 'text.disabled', fontSize: 14 }}
        >
          {t('auth:guestMode')}
        </Button>
      </Box>

      {/* 비회원 안내 모달 */}
      <GuestModeModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onConfirm={handleGuestConfirm}
      />
    </Box>
  )
}
