"""
Alembic 환경 설정
"""
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Alembic Config 객체
config = context.config

# 로깅 설정
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 모델의 MetaData 객체 가져오기
from app.database import Base
from app.config import settings

# 모든 모델 import (마이그레이션 자동 감지를 위해 필요)
from app.models.base import BaseModel  # noqa
from app.models.user import User  # noqa

target_metadata = Base.metadata

# 환경변수에서 DATABASE_URL 가져오기
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace('+asyncpg', '+psycopg2'))


def run_migrations_offline() -> None:
    """
    오프라인 모드로 마이그레이션 실행
    DB 연결 없이 SQL 스크립트만 생성
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """실제 마이그레이션 실행"""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """비동기로 마이그레이션 실행"""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.DATABASE_URL.replace('+asyncpg', '+psycopg2')

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """
    온라인 모드로 마이그레이션 실행
    실제 DB에 연결하여 마이그레이션 수행
    """
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
