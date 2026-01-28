/**
 * MUI Palette 타입 확장 (custom 속성 추가)
 */

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      bgTertiary: string
      borderColor: string
    }
  }
  interface PaletteOptions {
    custom?: {
      bgTertiary?: string
      borderColor?: string
    }
  }
}

export {}
