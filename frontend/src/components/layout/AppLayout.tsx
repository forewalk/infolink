/**
 * 공통 페이지 레이아웃 (AppHeader + Container + 배경 Box)
 */
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { AppHeader } from './AppHeader'

interface AppLayoutProps {
  title: string
  showBack?: boolean
  backTo?: string
  children: React.ReactNode
}

export function AppLayout({ title, showBack, backTo, children }: AppLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3, px: 2 }}>
      <Container maxWidth="md" disableGutters>
        <AppHeader title={title} showBack={showBack} backTo={backTo} />
        <Box sx={{ mt: 2 }}>{children}</Box>
      </Container>
    </Box>
  )
}
