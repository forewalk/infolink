/**
 * MUI 테마 생성 함수
 * 기존 CSS 변수 색상 팔레트를 MUI 테마로 매핑
 */
import { createTheme } from '@mui/material/styles'
import './types'

export function getTheme(mode: 'light' | 'dark') {
  const isLight = mode === 'light'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? '#4A90D9' : '#5B9BD5',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#4CAF50',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#F44336',
      },
      warning: {
        main: '#FF9800',
      },
      info: {
        main: '#2196F3',
      },
      success: {
        main: '#4CAF50',
      },
      background: {
        default: isLight ? '#FAFAFA' : '#1A1A1A',
        paper: isLight ? '#FFFFFF' : '#2D2D2D',
      },
      text: {
        primary: isLight ? '#1A1A1A' : '#FFFFFF',
        secondary: isLight ? '#666666' : '#AAAAAA',
        disabled: isLight ? '#999999' : '#888888',
      },
      divider: isLight ? '#E5E5E5' : '#3D3D3D',
      custom: {
        bgTertiary: isLight ? '#F5F5F5' : '#3D3D3D',
        borderColor: isLight ? '#CCCCCC' : '#444444',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            minWidth: 320,
          },
        },
      },
    },
  })
}
