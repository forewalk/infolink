"""
Alembic Environment Configuration
"""
from logging.config import fileConfig

from sqlalchemy import pool, engine_from_config
from sqlalchemy.engine import Connection

from alembic import context

# Alembic Config object
config = context.config

# Logging configuration
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import models MetaData
from app.database import Base
from app.config import settings

# Import all models for autogenerate detection
from app.models.base import BaseModel  # noqa
from app.models.user import User  # noqa
from app.models.board import Board  # noqa

target_metadata = Base.metadata

# Set DATABASE_URL (convert asyncpg to psycopg2 for sync migrations)
sync_url = settings.DATABASE_URL.replace('+asyncpg', '+psycopg2').replace('postgresql+asyncpg', 'postgresql+psycopg2')
config.set_main_option("sqlalchemy.url", sync_url)


def run_migrations_offline() -> None:
    """
    Run migrations in offline mode.
    Generates SQL scripts without DB connection.
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


def run_migrations_online() -> None:
    """
    Run migrations in online mode.
    Connects to actual DB and performs migrations.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
