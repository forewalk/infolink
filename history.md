# 작업 이력

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
