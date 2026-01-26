# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 규칙

- **모든 대화와 문서는 한글로 작성**
- 코드 주석도 한글 사용 권장
- 커밋 메시지도 한글 가능

## 프로젝트 개요

Infolink - 상품페이지 링크 및 설명, 로그인/어드민 기능을 테스트하는 웹 애플리케이션

- **모노레포**: FastAPI 백엔드 + React 프론트엔드
- **언어**: Python 3.11+ / TypeScript
- **데이터베이스**: PostgreSQL (SQLAlchemy async + asyncpg)
- **주요 라이브러리**: FastAPI, Pydantic v2, Alembic, React, Vite, Axios

### 환경 설정

- DB 서버 정보: `docs/INSTALL.md` 참조
- 환경변수: `backend/.env`, `frontend/.env` (`.env.example` 복사 후 수정)

## 개발 명령어

### 백엔드 (FastAPI)

```bash
cd backend

# 초기 설정
conda create -n infolink python=3.11 && conda activate infolink
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 개발 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 데이터베이스 마이그레이션
alembic revision --autogenerate -m "설명"
alembic upgrade head
alembic downgrade -1

# 테스트
pytest                                    # 전체 테스트
pytest tests/test_api/test_users.py       # 단일 파일 테스트
pytest -k "test_create_user"              # 특정 테스트만 실행
pytest --cov=app --cov-report=html        # 커버리지 포함

# 린트
flake8 app/
mypy app/
black app/
```

### 프론트엔드 (React + Vite)

```bash
cd frontend

# 설정
npm install

# 개발 서버 실행
npm run dev          # http://localhost:5173

# 빌드 및 테스트
npm run build
npm run lint
npm run test
```

## 백엔드 아키텍처

### 레이어 패턴

모든 백엔드 기능은 다음 레이어 패턴을 따름:

```
Model → Schema → Repository → Service → Endpoint
```

| 레이어 | 위치 | 역할 |
|--------|------|------|
| Model | `app/models/{기능}.py` | SQLAlchemy DB 모델 (BaseModel 상속) |
| Schema | `app/schemas/{기능}.py` | Pydantic 검증 스키마 |
| Repository | `app/repositories/{기능}.py` | 데이터 액세스 레이어 |
| Service | `app/services/{기능}.py` | 비즈니스 로직 레이어 |
| Endpoint | `app/api/v1/endpoints/{기능}.py` | FastAPI 라우트 핸들러 |

### 핵심 모듈

| 모듈 | 역할 |
|------|------|
| `app/main.py` | FastAPI 앱 인스턴스, CORS 설정, 라우터 등록 |
| `app/config.py` | Pydantic Settings 기반 환경변수 설정 |
| `app/database.py` | AsyncSession, get_db 의존성 |
| `app/models/base.py` | BaseModel (id, created_at, updated_at, deleted_at) |
| `app/core/security.py` | 인증/보안 유틸리티 |
| `app/api/deps.py` | 공통 의존성 주입 |

### 스키마 패턴

각 기능마다 4개의 Pydantic 스키마 생성:
- `{Feature}Base` - 공통 필드
- `{Feature}Create` - 생성용 필수 필드
- `{Feature}Update` - 수정용 Optional 필드
- `{Feature}Response` - id와 타임스탬프 포함 응답용

### 데이터베이스 규칙

- **테이블**: snake_case, 복수형 (예: `users`, `order_items`)
- **Primary Key**: `id` (BIGINT, autoincrement)
- **Foreign Key**: `{테이블단수}_id` 형식
- **Boolean**: `is_` 또는 `has_` 접두사
- **타임스탬프**: `created_at`, `updated_at`, `deleted_at` (soft delete) 필수

### 테스트 구조

```
tests/
├── conftest.py           # 공용 fixture (db_session, client)
├── test_api/             # API 엔드포인트 테스트
├── test_repositories/    # Repository 레이어 테스트
└── test_services/        # Service 레이어 테스트
```

테스트는 별도 DB(`DATABASE_URL_TEST`) 사용, 각 테스트 후 자동 롤백

## 프론트엔드 아키텍처

```
src/
├── main.tsx          # 앱 진입점
├── App.tsx           # 라우트 설정
├── pages/            # 페이지 컴포넌트
├── components/       # 재사용 컴포넌트 (common/, features/)
├── services/api.ts   # Axios API 클라이언트
├── hooks/            # 커스텀 훅
├── store/            # 상태 관리
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수
```

### 경로 별칭 (vite.config.ts)

임포트 시 상대경로 대신 별칭 사용:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@services/` → `src/services/`
- `@hooks/` → `src/hooks/`
- `@types/` → `src/types/`

### API 클라이언트 (`services/api.ts`)

- `api` 인스턴스를 통해 `/api/v1/*` 엔드포인트로 전송
- 요청 인터셉터: `localStorage`의 `access_token`을 `Bearer` 헤더에 자동 추가
- 응답 인터셉터: 401 응답 시 토큰 삭제 후 `/login`으로 리다이렉트

## 9단계 개발 워크플로우

기능 개발 시 `docs/workflows/{기능명}/` 폴더에 문서 생성

```
1.기획서작성(사람) → 2.AI검토 → 3.기획확정 → 4.개발계획(AI) → 5.계획승인
                                                                    ↓
                        9.문서화 ← 8.코드리뷰(사람) ← 7.테스트 ← 6.개발실행
```

### 워크플로우 명령어

| 명령어 | 설명 |
|--------|------|
| `/workflow-start {기능}` | 워크플로우 폴더 및 템플릿 생성 |
| `/review-spec {기능}` | 기획서 검토 (2단계) |
| `/finalize-spec {기능}` | 기획서 확정 (3단계) |
| `/create-dev-plan {기능}` | 개발 계획 생성 (4단계) |
| `/approve-dev-plan {기능}` | 개발 계획 승인 (5단계) |
| `/develop {기능}` | 구현 실행 (6단계) |
| `/test {기능}` | 테스트 실행 (7단계) |
| `/create-docs {기능}` | 기술 문서 생성 (9단계) |

- 커맨드 정의: `commands/`
- 템플릿: `workflow/templates/`
- 전체 가이드: `workflow/workflow_templates/WORKFLOW_GUIDE.md`

## Git 규칙

- 메인 브랜치: `main` (배포용)
- 개발 브랜치: `develop` (기본 작업 브랜치)
- 기능 브랜치: `feature/{기능명}`
- 커밋 접두사: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## API 문서

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
