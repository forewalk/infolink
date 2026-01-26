# Infolink 프로젝트 아키텍처

## 전체 구성도

```mermaid
flowchart TB
    subgraph CLIENT["브라우저"]
        BROWSER["사용자"]
    end

    subgraph DEV["로컬 개발 환경 (PC)"]
        subgraph FE["Frontend"]
            VITE["Vite Dev Server<br/>:5173"]
            REACT["React + TypeScript"]
            NPM["npm"]
        end

        subgraph BE["Backend"]
            UVICORN["Uvicorn (ASGI)<br/>:8000"]
            FASTAPI["FastAPI"]
            SQLA["SQLAlchemy ORM"]
            CONDA["Conda 가상환경"]
        end
    end

    subgraph DB_SERVER["DB 서버"]
        POSTGRES["PostgreSQL<br/>:10023"]
    end

    BROWSER -->|"http://localhost:5173"| VITE
    VITE --> REACT
    REACT -->|"API 호출<br/>/api/v1/*"| UVICORN
    UVICORN --> FASTAPI
    FASTAPI --> SQLA
    SQLA -->|"DB 연결"| POSTGRES
```

## 배포 흐름

```mermaid
flowchart LR
    subgraph DEV["개발 PC"]
        CODE["코드 작성"]
    end

    subgraph GIT["Git Repository"]
        FEATURE["feature/*"]
        DEVELOP["develop"]
        MAIN["main"]

        FEATURE -->|"merge"| DEVELOP
        DEVELOP -->|"release"| MAIN
    end

    subgraph CICD["CI/CD Pipeline"]
        BUILD_FE["Frontend Build<br/>(npm run build)"]
        BUILD_BE["Backend Build"]
        DOCKER_FE["Docker Build<br/>(Nginx + React)"]
        DOCKER_BE["Docker Build<br/>(FastAPI)"]
        PUSH["Image Push<br/>(Registry)"]

        BUILD_FE --> DOCKER_FE
        BUILD_BE --> DOCKER_BE
        DOCKER_FE --> PUSH
        DOCKER_BE --> PUSH
    end

    subgraph PROD["프로덕션 서버"]
        NGINX_PROD["Nginx Container<br/>(React 정적 파일)"]
        FASTAPI_PROD["FastAPI Container"]
        POSTGRES_PROD["PostgreSQL"]

        NGINX_PROD -->|"/api/* 프록시"| FASTAPI_PROD
        FASTAPI_PROD --> POSTGRES_PROD
    end

    CODE -->|"git push"| FEATURE
    MAIN -->|"trigger"| CICD
    PUSH -->|"deploy"| PROD
```

## 백엔드 레이어 구조

```mermaid
flowchart LR
    REQ["API 요청"] --> EP["Endpoint<br/>(api/v1/endpoints/)"]
    EP --> SVC["Service<br/>(services/)"]
    MODEL["Model<br/>(models/)"] --> SVC
    DB["PostgreSQL"] --> SVC
```

## 프론트엔드 구조

```mermaid
flowchart TB
    subgraph FRONTEND["Frontend (React)"]
        MAIN["main.tsx"]
        APP["App.tsx"]

        subgraph PAGES["pages/"]
            PAGE["페이지 컴포넌트"]
        end

        subgraph COMPONENTS["components/"]
            COMMON["common/"]
            FEATURES["features/"]
        end

        subgraph STATE["상태 관리"]
            HOOKS["hooks/"]
            STORE["store/"]
        end

        subgraph SERVICES["services/"]
            API["api.ts<br/>(Axios)"]
        end
    end

    MAIN --> APP --> PAGES
    PAGES --> COMPONENTS
    PAGES --> STATE
    PAGES --> API
    API -->|"HTTP"| BACKEND["FastAPI"]
```

## 기술 스택

| 구분 | 개발 환경 | 프로덕션 환경 |
|------|----------|--------------|
| 프론트엔드 | Vite Dev Server | Nginx + React Build |
| 백엔드 | Uvicorn (직접 실행) | Docker Container |
| 데이터베이스 | PostgreSQL (서버) | PostgreSQL |
| 패키지 관리 | npm, pip/conda | Docker Image |

## 나중에 만들 파일 (CI/CD)

| 파일 | 용도 | 상태 |
|------|------|------|
| `frontend/Dockerfile` | React 빌드 + Nginx 이미지 | 예정 |
| `backend/Dockerfile` | FastAPI + Uvicorn 이미지 | 예정 |
| `docker-compose.yml` | 로컬 통합 테스트용 | 예정 |
| `docker-compose.prod.yml` | 프로덕션 배포용 | 예정 |
| `.gitlab-ci.yml` | CI/CD 파이프라인 | 예정 |
