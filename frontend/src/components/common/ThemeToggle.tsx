/**
 * 다크모드 토글 버튼
 */
import IconButton from '@mui/material/IconButton'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useThemeStore } from '@/store/themeStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <IconButton onClick={toggleTheme} size="small" color="inherit">
      {theme === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
    </IconButton>
  )
}
