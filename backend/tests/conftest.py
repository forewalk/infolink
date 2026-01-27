"""
Pytest 설정 및 공통 픽스처
"""
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.database import Base
from app.api.deps import get_db_session
from app.config import settings


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """테스트용 DB 세션"""
    engine = create_async_engine(
        settings.DATABASE_URL_TEST or settings.DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
    )

    # 테이블 생성 (checkfirst=True 기본값: 이미 있으면 건너뜀)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    # 테이블은 유지, 데이터만 삭제 (DROP 불필요)
    async with engine.begin() as conn:
        await conn.execute(text("DELETE FROM boards"))
        await conn.execute(text("DELETE FROM users"))

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """테스트용 HTTP 클라이언트"""
    async def override_get_db_session():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
