# Infolink

상품페이지 링크 및 설명, 로그인/어드민 기능을 제공하는 웹 애플리케이션

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | FastAPI, SQLAlchemy (async), PostgreSQL, Alembic |
| Frontend | React, TypeScript, Vite, Zustand |
| 인증 | JWT (python-jose, bcrypt) |

## 빠른 시작

### 1. 저장소 클론

```bash
git clone git@github.com:forewalk/infolink.git
cd infolink
```

### 2. 백엔드 설정

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # .env 파일 수정

# DB 마이그레이션
alembic upgrade head

# 서버 실행
uvicorn app.main:app --reload --port 8000
```

### 3. 프론트엔드 설정

```bash
cd frontend
npm install

# 개발 서버 실행
npm run dev
```

### 4. 접속

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:5173 |
| API 문서 (Swagger) | http://localhost:8000/docs |
| API 문서 (ReDoc) | http://localhost:8000/redoc |

## 프로젝트 구조

```
infolink/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # API 엔드포인트
│   │   ├── models/             # SQLAlchemy 모델
│   │   ├── schemas/            # Pydantic 스키마
│   │   ├── repositories/       # 데이터 액세스 레이어
│   │   ├── services/           # 비즈니스 로직
│   │   └── core/               # 보안, 설정 등
│   └── alembic/                # DB 마이그레이션
├── frontend/
│   └── src/
│       ├── pages/              # 페이지 컴포넌트
│       ├── components/         # 재사용 컴포넌트
│       ├── store/              # Zustand 스토어
│       ├── services/           # API 서비스
│       ├── hooks/              # 커스텀 훅
│       └── types/              # TypeScript 타입
└── docs/                       # 문서
```

## 구현된 기능

### 인증 (2026-01-26)

- 로그인 - 이메일/비밀번호 인증, JWT 토큰 발급
- 세션 유지 - Zustand persist로 새로고침 시 상태 유지
- 비회원 모드 - 제한된 기능으로 둘러보기

**API 엔드포인트:**
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/v1/auth/login | 로그인 |
| GET | /api/v1/auth/me | 현재 사용자 정보 |

## 개발 이력

| 날짜 | 내용 |
|------|------|
| 2026-01-26 | 로그인 기능 구현 (JWT 인증, 로그인 페이지, Zustand 상태관리) |
| 2026-01-19 | 프로젝트 구조 정리, 서버 DB 설정, 아키텍처 문서화 |
| 2026-01-15 | 프로젝트 초기 설정 (백엔드/프론트엔드 기본 구조) |

## 브랜치 전략

- `main` - 프로덕션 (배포용)
- `develop` - 개발 브랜치
- `feature/*` - 기능 개발

## 문서

- [CLAUDE.md](./CLAUDE.md) - 개발 가이드 (Claude Code용)
- [docs/INSTALL.md](./docs/INSTALL.md) - 설치 가이드
- [docs/architecture.md](./docs/architecture.md) - 아키텍처 문서
- [docs/GIT_GUIDE.md](./docs/GIT_GUIDE.md) - Git 작업 가이드
- [history.md](./history.md) - 상세 작업 이력
