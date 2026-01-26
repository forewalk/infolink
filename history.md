# 작업 이력

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
