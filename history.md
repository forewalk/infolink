# 작업 이력

## 2026-01-28 - MUI 전체 도입

### MUI (Material UI) 마이그레이션
- 모든 인라인 스타일을 MUI 컴포넌트로 전환
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` 설치 (v7.3.7)

### MUI 테마 시스템 구축
- `src/theme/types.ts`: Palette 타입 확장 (custom.bgTertiary, custom.borderColor)
- `src/theme/theme.ts`: `getTheme(mode)` 함수 - 기존 CSS 변수 색상을 MUI palette에 매핑
- `App.tsx`: `ThemeProvider` + `CssBaseline` 래핑, `useMemo`로 테마 생성
- `themeStore.ts`: DOM 조작(`applyTheme`, `data-theme`) 제거, 상태만 유지

### 공통 레이아웃 컴포넌트 신규 생성
- `components/layout/AppLayout.tsx`: 페이지 래퍼 (AppHeader + Container + 배경)
- `components/layout/AppHeader.tsx`: AppBar + Toolbar (타이틀, 뒤로가기, 언어/테마/로그아웃)
- `components/common/ThemeToggle.tsx`: MUI IconButton (DarkMode/LightMode)
- `components/common/LanguageSelect.tsx`: MUI Select (i18n 언어 감지 정규화 포함)
- 4개 페이지에 반복되던 헤더 코드를 공통 컴포넌트로 통합

### 모달 → MUI Dialog 전환
- `GuestModeModal.tsx`: Dialog + DialogTitle/Content/Actions
- `LoginRequiredModal.tsx`: Dialog + Close IconButton

### 페이지별 MUI 전환
- `LoginPage.tsx`: Avatar(로고 이미지), TextField(filled), Button(secondary), 수직 중앙 정렬
- `ProductsPage.tsx`: AppLayout, Paper elevation
- `BoardListPage.tsx`: Card + CardActionArea, Stack
- `BoardDetailPage.tsx`: Paper, Divider, EditIcon/DeleteIcon
- `BoardWritePage.tsx`: TextField(outlined) with label/helperText, Paper(form)

### 로고 추가
- `src/images/logo.png`: goodnak.png 로고 이미지 적용 (LoginPage Avatar)

### CSS 정리
- `src/styles/themes.css` 삭제 (MUI ThemeProvider가 대체)
- `main.tsx`에서 themes.css import 제거
- `index.css` 최소화 (CssBaseline이 대체)

### 문서 업데이트
- `CLAUDE.md`: MUI 테마/공통 컴포넌트/모달 패턴/사용 규칙 섹션 추가
- `readme.md`: 기술 스택에 MUI 추가

---

## 2026-01-28 - 프론트엔드 UI 개선

### 첫 화면 변경
- 기본 라우트(`/`, `*`)를 `/products` → `/login`으로 변경 (`App.tsx`)

### 로그인 페이지 다크모드/다국어 지원
- `LoginPage.tsx`: useThemeStore, useTranslation 연동, CSS 변수 적용
- 상단 우측에 언어 선택 드롭다운 + 다크모드 토글 버튼 추가
- 모든 하드코딩 텍스트를 `t()` 번역 키로 교체
- `GuestModeModal.tsx`: i18n + CSS 변수 적용

### 게시판 카드형 레이아웃
- `BoardListPage.tsx`: 4컬럼 그리드 테이블 → 카드 리스트 레이아웃으로 변경
- 카드 구성: 제목, 내용 미리보기(2줄), 작성자/작성일/조회수 메타 정보
- 호버 시 그림자 + 미세 상승 애니메이션

### 비회원 글쓰기 거부 팝업
- `LoginRequiredModal.tsx` 신규 생성 (reject.svg 디자인 기반)
- 비인증 상태에서 글쓰기 클릭 시 모달 표시 (기존: /login으로 직접 이동)
- "다음에 할게요" / "로그인하러 가기" 두 버튼 제공

### 게시판 뒤로가기 버튼
- `BoardListPage.tsx`: 헤더 좌측에 ← 뒤로가기 버튼 추가, 클릭 시 `/products`로 이동

### 번역 파일 업데이트
- `ko/auth.json`, `en/auth.json`: appDescription, loggingIn, emailRequired, guestModeTitle, guestModeWarning, loginRequired, maybeLater 추가
- `ko/board.json`, `en/board.json`: writeLoginRequired 추가

### 불필요한 파일 정리
- `frontend/figma/main.svg` 삭제 (0바이트 빈 파일)
- `frontend/src/App.css` 삭제 (미사용 CSS) + `App.tsx`에서 import 제거
- `docs/workflows/ui-enhancement/5~9_*_placeholder.md` 삭제 (빈 placeholder 5개)

---

## 2026-01-26 - 로그인 기능 구현

### 백엔드
- User 모델/스키마/레포지토리/서비스 생성
- Auth 서비스 및 API 엔드포인트 구현 (POST /login, GET /me)
- JWT 인증 의존성 추가 (get_current_user, get_current_user_optional)
- Alembic 마이그레이션 파일 생성
- bcrypt 직접 사용하도록 security.py 수정 (passlib 호환성 이슈)

### 프론트엔드
- Zustand 상태관리 도입 (authStore)
- 인증 서비스/훅 구현 (authService, useAuth)
- 로그인 페이지 구현 (피그마 디자인 적용)
- 비회원 모드 모달 구현
- 상품 페이지 placeholder 생성
- React Router 라우팅 설정 (PrivateRoute, PublicRoute)

### 테스트 계정
- test@example.com / password123
- admin@example.com / admin123

---

## 2026-01-19 - 프로젝트 검토 및 정리

- 서버 DB 설정 완료 (PostgreSQL, 외부 포트 10023)
- npm으로 패키지 매니저 통일
- 누락된 폴더 생성 (alembic/versions, frontend 구조)
- 아키텍처 문서 작성 (`docs/architecture.md`)
- 배포 흐름 및 CI/CD 계획 문서화

---

## 2026-01-15 - 프로젝트 초기 설정 완료

- CLAUDE.md 생성 (한글, 개발 가이드)
- 백엔드 구조 생성 (FastAPI, SQLAlchemy, Alembic)
- 프론트엔드 구조 생성 (React, Vite, TypeScript)
- 설정 파일 생성 (.env.example, requirements.txt, package.json 등)

---
