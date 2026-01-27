# UI 개선 (i18n, 다크모드, 게시판) 기능 개발 계획서

**작성일:** 2026-01-27
**작성자:** Claude AI
**기반 문서:** `3_ui-enhancement_spec_final.md`
**상태:** 초안

---

## 개발 개요

### 목표
1. **i18n**: 한글/영어 다국어 지원 (react-i18next)
2. **다크모드**: 라이트/다크 테마 전환 (CSS 변수 기반)
3. **게시판**: 게시글 CRUD + 무한스크롤 (백엔드 + 프론트엔드)

### 개발 범위
- **백엔드**: boards 테이블, API 5개 (목록/상세/작성/수정/삭제)
- **프론트엔드**: i18n 설정, 테마 시스템, 게시판 페이지 3개

---

## 1. 백엔드 아키텍처 설계

### 1.1 레이어 구조

```
app/api/v1/endpoints/boards.py  (Endpoint)
         ↓
app/services/board.py           (Service)
         ↓
app/repositories/board.py       (Repository)
         ↓
app/models/board.py             (Model)
```

### 1.2 컴포넌트 설계

#### Model (app/models/board.py)
- 클래스: `Board`
- BaseModel 상속 (id, created_at, updated_at, deleted_at)
- 추가 필드: user_id, title, content, view_count

#### Schema (app/schemas/board.py)
- `BoardBase`: title, content
- `BoardCreate`: BoardBase 상속
- `BoardUpdate`: title(Optional), content(Optional)
- `BoardResponse`: 전체 필드 + author_name
- `BoardListResponse`: 무한스크롤용 (items, next_cursor, has_more)

#### Repository (app/repositories/board.py)
- `BoardRepository`
- 메서드: create, get_by_id, get_list, update, soft_delete, increment_view_count

#### Service (app/services/board.py)
- `BoardService`
- 메서드: create_board, get_board, get_board_list, update_board, delete_board

#### Endpoint (app/api/v1/endpoints/boards.py)
- 라우터: `/api/v1/boards`
- GET /: 목록 조회 (인증 선택)
- GET /{id}: 상세 조회 (인증 선택)
- POST /: 작성 (인증 필수)
- PUT /{id}: 수정 (인증 필수, 작성자만)
- DELETE /{id}: 삭제 (인증 필수, 작성자만)

---

## 2. 데이터베이스 설계

### 2.1 테이블 스키마

```sql
CREATE TABLE boards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_boards_created_at ON boards(created_at DESC);
```

### 2.2 컬럼 상세

| 컬럼명 | 타입 | Null | 기본값 | 설명 |
|--------|------|------|--------|------|
| id | BIGINT | NO | AUTO | PK |
| user_id | BIGINT | NO | - | 작성자 FK |
| title | VARCHAR(200) | NO | - | 제목 |
| content | TEXT | NO | - | 내용 (최대 10,000자) |
| view_count | INTEGER | NO | 0 | 조회수 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |
| deleted_at | TIMESTAMP | YES | NULL | 삭제일시 |

---

## 3. API 설계

### 3.1 게시글 목록 조회 (무한스크롤)

```
GET /api/v1/boards?cursor={last_id}&limit=20
Authorization: Bearer <token> (선택)

Response (200):
{
  "items": [...],
  "next_cursor": 5,
  "has_more": true
}
```

### 3.2 게시글 상세 조회

```
GET /api/v1/boards/{id}

Response (200):
{
  "id": 1,
  "title": "제목",
  "content": "내용",
  "view_count": 11,
  "author_name": "작성자",
  "is_author": true,
  "created_at": "..."
}
```

### 3.3 게시글 작성

```
POST /api/v1/boards
Authorization: Bearer <token> (필수)

Request: { "title": "제목", "content": "내용" }
Response (201): 생성된 게시글
```

### 3.4 게시글 수정

```
PUT /api/v1/boards/{id}
Authorization: Bearer <token> (필수)

Request: { "title": "수정", "content": "수정" }
Response (200): 수정된 게시글
```

### 3.5 게시글 삭제

```
DELETE /api/v1/boards/{id}
Authorization: Bearer <token> (필수)

Response (204): No Content
```

---

## 4. 프론트엔드 설계

### 4.1 i18n 설정

**파일 구조:**
```
frontend/src/i18n/
├── index.ts
└── locales/
    ├── ko/ (common.json, auth.json, board.json)
    └── en/ (common.json, auth.json, board.json)
```

**의존성:** react-i18next, i18next, i18next-browser-languagedetector

### 4.2 다크모드 설정

**CSS 변수 기반:**
- :root - 라이트 테마 변수
- [data-theme="dark"] - 다크 테마 변수

**Zustand 스토어:** themeStore.ts

### 4.3 게시판 컴포넌트

- BoardListPage.tsx - 목록 (무한스크롤)
- BoardDetailPage.tsx - 상세
- BoardWritePage.tsx - 작성/수정
- boardService.ts - API 호출

---

## 5. 마이그레이션 계획

```bash
cd backend
alembic revision --autogenerate -m "add boards table"
alembic upgrade head
```

---

## 6. 의존성 관리

### 프론트엔드 (추가 필요)

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

---

## 7. 구현 순서

### Phase 1: 백엔드 기본 구조
- [ ] Board 모델 생성
- [ ] Board 스키마 생성
- [ ] Alembic 마이그레이션

### Phase 2: 백엔드 데이터/비즈니스 레이어
- [ ] BoardRepository 구현
- [ ] BoardService 구현

### Phase 3: 백엔드 API 레이어
- [ ] boards 엔드포인트 구현
- [ ] api/v1/api.py에 라우터 등록

### Phase 4: 프론트엔드 인프라
- [ ] i18n 패키지 설치 및 설정
- [ ] 번역 파일 생성 (ko, en)
- [ ] 다크모드 테마 시스템 구현
- [ ] 기존 컴포넌트 i18n 적용

### Phase 5: 프론트엔드 게시판
- [ ] boardService.ts
- [ ] BoardListPage (무한스크롤)
- [ ] BoardDetailPage
- [ ] BoardWritePage
- [ ] 메인페이지 게시판 버튼
- [ ] 라우팅 설정

### Phase 6: 통합 및 검증
- [ ] 전체 기능 테스트
- [ ] 린트 및 타입 체크

---

## 8. 생성될 파일 목록

### 백엔드 (6개 신규, 4개 수정)
- app/models/board.py (신규)
- app/schemas/board.py (신규)
- app/repositories/board.py (신규)
- app/services/board.py (신규)
- app/api/v1/endpoints/boards.py (신규)
- alembic/versions/xxx_add_boards_table.py (신규)
- app/models/__init__.py (수정)
- app/schemas/__init__.py (수정)
- app/repositories/__init__.py (수정)
- app/api/v1/api.py (수정)

### 프론트엔드 (10개+ 신규, 3개 수정)
- src/i18n/index.ts (신규)
- src/i18n/locales/ko/*.json (신규)
- src/i18n/locales/en/*.json (신규)
- src/store/themeStore.ts (신규)
- src/styles/themes.css (신규)
- src/pages/BoardListPage.tsx (신규)
- src/pages/BoardDetailPage.tsx (신규)
- src/pages/BoardWritePage.tsx (신규)
- src/services/boardService.ts (신규)
- src/App.tsx (수정)
- src/main.tsx (수정)
- package.json (수정)

---

## 9. 보안 고려사항

- XSS 방지: 게시글 내용 렌더링 시 escape
- SQL Injection: SQLAlchemy ORM 사용으로 방지
- 인증/인가: JWT 토큰 검증, user_id 소유권 확인
- 입력 검증: Pydantic 스키마로 길이 제한 (제목 200자, 내용 10,000자)

---

## 10. 다음 단계

5단계: 개발 계획 승인 후 개발 시작

---

**문서 상태:** 초안 (검토 대기)
