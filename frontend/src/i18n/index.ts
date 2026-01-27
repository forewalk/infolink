/**
 * i18n 설정
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 번역 파일 import
import koCommon from './locales/ko/common.json'
import koAuth from './locales/ko/auth.json'
import koBoard from './locales/ko/board.json'

import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enBoard from './locales/en/board.json'

const resources = {
  ko: {
    common: koCommon,
    auth: koAuth,
    board: koBoard,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    board: enBoard,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    defaultNS: 'common',
    ns: ['common', 'auth', 'board'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
