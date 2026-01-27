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
- **주요 라이브러리**: FastAPI, Pydantic v2, Alembic, React, Vite, Axios, Zustand, react-i18next

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
npm run build        # tsc && vite build
npm run lint
npm run test         # vitest
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

### 새 기능 추가 시 등록 체크리스트

새 기능 모듈 생성 후 반드시 아래 파일들에 등록해야 함:

1. **`app/models/__init__.py`** - 모델 클래스 임포트 추가
2. **`app/schemas/__init__.py`** - 스키마 클래스 임포트 추가
3. **`app/repositories/__init__.py`** - Repository 클래스 임포트 추가
4. **`app/services/__init__.py`** - Service 클래스 임포트 추가
5. **`app/api/v1/endpoints/__init__.py`** - 라우터 임포트 추가
6. **`app/api/v1/api.py`** - `api_router.include_router()` 추가
7. **`alembic/env.py`** - 모델 임포트 추가 (autogenerate가 테이블을 감지하도록)

### 핵심 모듈

| 모듈 | 역할 |
|------|------|
| `app/main.py` | FastAPI 앱 인스턴스, CORS 설정, 라우터 등록 |
| `app/config.py` | Pydantic Settings 기반 환경변수 설정 |
| `app/database.py` | AsyncSession, `get_db()` 의존성 (세션 auto-commit/rollback) |
| `app/models/base.py` | BaseModel (id, created_at, updated_at, deleted_at) |
| `app/core/security.py` | JWT 인증 (HS256), 비밀번호 해싱 (python-jose, passlib) |
| `app/api/deps.py` | `get_db_session()` (get_db 래퍼), `get_current_user()` (필수 인증), `get_current_user_optional()` (게스트 허용) |

### DB 의존성 체인

엔드포인트에서 사용하는 DB 세션 의존성 흐름:
```
database.py: get_db() → deps.py: get_db_session() → 엔드포인트
```
테스트 시 `conftest.py`에서 `get_db_session`을 오버라이드하여 테스트 DB 세션을 주입함

### 스키마 패턴

각 기능마다 4개의 Pydantic 스키마 생성 (`model_config = ConfigDict(from_attributes=True)`):
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
- **Soft delete**: 물리 삭제 대신 `deleted_at` 설정. Repository에서 모든 쿼리에 `deleted_at.is_(None)` 필터 적용

### 페이지네이션 패턴

커서 기반 페이지네이션 사용 (Board 등):
- 쿼리: `WHERE id < cursor ORDER BY id DESC LIMIT limit+1`
- `limit+1`개 조회하여 `has_more` 판별, 실제 반환은 `limit`개
- 응답: `{ items, next_cursor, has_more }`

### 인증 의존성

- `get_current_user()` - 인증 필수 (HTTPBearer). JWT 디코딩 후 User 반환. 실패 시 401
- `get_current_user_optional()` - 인증 선택. 토큰 없으면 None 반환 (게스트 모드 지원)

### 테스트 구조

```
backend/tests/
├── conftest.py           # 공용 fixture (db_session, client), create_all/drop_all 격리
├── test_api/             # API 엔드포인트 테스트
├── test_repositories/    # Repository 레이어 테스트
└── test_services/        # Service 레이어 테스트
```

- 테스트는 별도 DB(`DATABASE_URL_TEST`) 사용
- `pytest.ini`에서 `asyncio_mode = auto` 설정 (async 테스트에 `@pytest.mark.asyncio` 불필요)
- 각 테스트 후 `DELETE`로 데이터 정리 (테이블 구조 유지)
- `conftest.py`의 `client` 픽스처가 `app.dependency_overrides`로 `get_db_session`을 테스트 DB 세션으로 교체

## 프론트엔드 아키텍처

### 경로 별칭 (vite.config.ts)

임포트 시 상대경로 대신 별칭 사용:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@pages/` → `src/pages/`
- `@services/` → `src/services/`
- `@store/` → `src/store/`
- `@hooks/` → `src/hooks/`
- `@types/` → `src/types/`
- `@utils/` → `src/utils/`
- `@assets/` → `src/assets/`

### 프록시 설정

Vite 개발 서버에서 `/api/*` 요청은 자동으로 `http://localhost:8000`으로 프록시됨

### API 클라이언트 (`services/api.ts`)

- `api` 인스턴스를 통해 `/api/v1/*` 엔드포인트로 전송
- 요청 인터셉터: `localStorage`의 `access_token`을 `Bearer` 헤더에 자동 추가
- 응답 인터셉터: 401 응답 시 토큰 삭제 후 `/login`으로 리다이렉트

### 상태 관리

Zustand 사용, persist 미들웨어로 새로고침 시 상태 유지:
- `authStore.ts` - 사용자 정보, isAuthenticated, isGuest 상태 관리 (key: `auth-storage`)
- `themeStore.ts` - light/dark 테마 관리, 시스템 테마 감지 (key: `theme-storage`)

### 라우팅 패턴

`App.tsx`에서 라우트 가드 적용:
- `PublicRoute` - 비로그인 사용자만 접근 (로그인 페이지 등)
- `PrivateRoute` - 인증된 사용자 또는 게스트 모드만 접근

현재 라우트 구조:
| 경로 | 페이지 | 가드 |
|------|--------|------|
| `/` | → `/products` 리다이렉트 | - |
| `/login` | LoginPage | PublicRoute |
| `/products` | ProductsPage | PrivateRoute |
| `/board` | BoardListPage | PrivateRoute |
| `/board/write` | BoardWritePage | PrivateRoute |
| `/board/edit/:id` | BoardWritePage | PrivateRoute |
| `/board/:id` | BoardDetailPage | PrivateRoute |
| `*` | → `/products` 리다이렉트 | - |

### i18n (다국어 지원)

- react-i18next 사용, 기본 언어: 한국어 (`ko`), 폴백: 영어 (`en`)
- 네임스페이스: `common`, `auth`, `board` 등 기능별 분리
- 번역 파일: `src/i18n/locales/{ko,en}/{namespace}.json`
- 새 기능 추가 시 해당 네임스페이스 JSON 파일을 ko/en 모두 생성

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

- 커맨드 정의: `commands/` (각 명령어별 .md 파일)
- 단계별 템플릿: `workflow/templates/` (1~9단계)
- 전체 가이드: `workflow/workflow_templates/WORKFLOW_GUIDE.md`

## Git 규칙

- 메인 브랜치: `main` (배포용)
- 개발 브랜치: `develop` (기본 작업 브랜치)
- 기능 브랜치: `feature/{기능명}`
- 커밋 접두사: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## API 엔드포인트 요약

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/v1/auth/login` | 로그인 (토큰 + 사용자 반환) | 불필요 |
| GET | `/api/v1/auth/me` | 현재 사용자 정보 | 필수 |
| GET | `/api/v1/boards` | 게시글 목록 (커서 페이지네이션) | 불필요 |
| GET | `/api/v1/boards/{id}` | 게시글 상세 (조회수 증가) | 불필요 |
| POST | `/api/v1/boards` | 게시글 작성 | 필수 |
| PUT | `/api/v1/boards/{id}` | 게시글 수정 (작성자만) | 필수 |
| DELETE | `/api/v1/boards/{id}` | 게시글 삭제 (작성자만, soft delete) | 필수 |
| GET | `/api/v1/ping` | API 핑 테스트 | 불필요 |

## API 문서

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
