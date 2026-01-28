# GEMINI.md

이 파일은 Infolink 저장소에서 Gemini 모델을 사용할 때 필요한 지침을 제공합니다.

## 언어 규칙

- **모든 대화와 문서는 한글로 작성합니다.**
- 코드 주석도 한글 사용을 권장합니다.
- 커밋 메시지도 한글로 작성할 수 있습니다.

## 프로젝트 개요

**Infolink** - 상품 페이지 링크 및 설명, 로그인/어드민 기능을 테스트하는 웹 애플리케이션입니다.

- **모노레포**: FastAPI 백엔드 + React 프론트엔드
- **언어**: Python 3.11+ / TypeScript
- **데이터베이스**: PostgreSQL (SQLAlchemy async + asyncpg 사용)
- **주요 라이브러리**:
    - **백엔드**: FastAPI, Pydantic v2, Alembic
    - **프론트엔드**: React, Vite, Axios, Zustand, react-i18next

### 환경 설정

- **DB 서버 정보**: `docs/INSTALL.md` 파일을 참조하세요.
- **환경변수**: `backend/`와 `frontend/` 디렉터리 각각에 있는 `.env.example` 파일을 `.env`로 복사한 후, 내용을 수정하여 사용하세요.

## 개발 명령어

### 백엔드 (FastAPI)

```bash
cd backend

# 초기 설정
# conda create -n infolink python=3.11 && conda activate infolink
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 개발 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 데이터베이스 마이그레이션
alembic revision --autogenerate -m "마이그레이션 설명"
alembic upgrade head
alembic downgrade -1

# 테스트
pytest                 # 전체 테스트 실행
pytest tests/test_api/test_users.py # 단일 파일 테스트 실행
pytest -k "test_create_user"       # 이름으로 특정 테스트 실행
pytest --cov=app --cov-report=html # 커버리지와 함께 테스트 실행

# 린트
flake8 app/
mypy app/
black app/
```

### 프론트엔드 (React + Vite)

```bash
cd frontend

# 초기 설정
npm install

# 개발 서버 실행
npm run dev # http://localhost:5173

# 빌드 및 테스트
npm run build # tsc && vite build
npm run lint
npm run test  # vitest
```

## 백엔드 아키텍처

### 레이어 패턴

모든 백엔드 기능은 다음의 레이어 패턴을 따릅니다:
`Model → Schema → Repository → Service → Endpoint`

| 레이어 | 위치 | 역할 |
|---|---|---|
| **Model** | `app/models/{기능}.py` | SQLAlchemy DB 모델 (BaseModel 상속) |
| **Schema** | `app/schemas/{기능}.py` | Pydantic 검증 스키마 |
| **Repository**| `app/repositories/{기능}.py`| 데이터 액세스 레이어 (DB 쿼리 처리) |
| **Service** | `app/services/{기능}.py` | 비즈니스 로직 레이어 |
| **Endpoint** | `app/api/v1/endpoints/{기능}.py`| FastAPI 라우트 핸들러 |

### 핵심 모듈

| 모듈 | 역할 |
|---|---|
| `app/main.py` | FastAPI 앱 인스턴스, CORS 설정, 라우터 등록 |
| `app/config.py` | Pydantic Settings를 이용한 환경변수 설정 |
| `app/database.py`| AsyncSession, `get_db()` 의존성을 통한 세션 관리 |
| `app/models/base.py`| `id`, `created_at`, `updated_at`, `deleted_at`을 제공하는 BaseModel |
| `app/core/security.py`| JWT 인증 (HS256) 및 비밀번호 해싱 |
| `app/api/deps.py`| `get_db_session`, `get_current_user` 등 의존성 주입 |

### 데이터베이스 규칙

- **테이블**: `snake_case` 사용, 복수형 이름 (예: `users`, `order_items`)
- **Primary Key**: `id` (BIGINT, autoincrement)
- **Foreign Key**: `{테이블단수}_id` 형식
- **Boolean**: `is_` 또는 `has_` 접두사 사용
- **타임스탬프**: 모든 테이블에 `created_at`, `updated_at`, `deleted_at` 포함
- **Soft Delete**: 물리적 삭제 대신 `deleted_at`을 설정하여 소프트 삭제 구현. 모든 쿼리는 `deleted_at.is_(None)` 필터를 포함해야 함.

## 프론트엔드 아키텍처

### 경로 별칭 (`vite.config.ts`)

상대 경로 대신 다음 별칭을 사용해 임포트합니다:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@pages/` → `src/pages/`
- `@services/` → `src/services/`
- `@store/` → `src/store/`

### API 클라이언트 (`services/api.ts`)

- `/api/v1/*` 엔드포인트를 대상으로 하는 Axios 인스턴스입니다.
- **요청 인터셉터**: `localStorage`에서 `access_token`을 가져와 `Authorization: Bearer <token>` 헤더를 자동으로 추가합니다.
- **응답 인터셉터**: 401 Unauthorized 응답 시, 토큰을 삭제하고 `/login` 페이지로 리다이렉트합니다.

### 상태 관리 (Zustand)

- **`authStore.ts`**: 사용자 정보, `isAuthenticated`, `isGuest` 상태를 관리하며, `localStorage`에 상태를 유지합니다.
- **`themeStore.ts`**: 라이트/다크 테마를 관리하며, `localStorage`에 상태를 유지합니다.

### 라우팅

`App.tsx`에서 다음 라우트 가드를 적용합니다:
- `PublicRoute`: 로그인하지 않은 사용자만 접근 가능 (예: 로그인 페이지).
- `PrivateRoute`: 인증된 사용자 또는 게스트 모드 사용자만 접근 가능.

## 9단계 개발 워크플로우

기능 개발 시 `docs/workflows/{기능명}/` 폴더에 문서를 생성합니다.

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

## API 엔드포인트 요약

| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/v1/auth/login` | 로그인 (토큰 + 사용자 정보 반환) | 불필요 |
| GET | `/api/v1/auth/me` | 현재 사용자 정보 조회 | 필수 |
| GET | `/api/v1/boards` | 게시글 목록 조회 (커서 페이지네이션) | 불필요 |
| GET | `/api/v1/boards/{id}` | 게시글 상세 조회 (조회수 증가) | 불필요 |
| POST | `/api/v1/boards` | 새 게시글 작성 | 필수 |
| PUT | `/api/v1/boards/{id}` | 게시글 수정 (작성자만 가능) | 필수 |
| DELETE | `/api/v1/boards/{id}`| 게시글 삭제 (작성자만 가능, soft delete)| 필수 |
| GET | `/api/v1/ping` | API 핑 테스트 | 불필요 |

## API 문서

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc