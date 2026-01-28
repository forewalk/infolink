/**
 * 언어 선택 컴포넌트
 */
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'react-i18next'

export function LanguageSelect() {
  const { i18n } = useTranslation()

  // i18n.language가 'ko-KR' 등 로케일 형태일 수 있으므로 앞 2글자만 사용
  const currentLang = i18n.language?.startsWith('ko') ? 'ko' : 'en'

  return (
    <Select
      value={currentLang}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      size="small"
      sx={{ minWidth: 90, fontSize: 14 }}
    >
      <MenuItem value="ko">한글</MenuItem>
      <MenuItem value="en">English</MenuItem>
    </Select>
  )
}
