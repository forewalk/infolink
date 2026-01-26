"""
Base 모델
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, DateTime
from app.database import Base


class BaseModel(Base):
    """
    모든 모델의 기본 클래스

    공통 필드:
    - id: Primary Key
    - created_at: 생성 시각
    - updated_at: 수정 시각
    - deleted_at: 삭제 시각 (Soft Delete)
    """
    __abstract__ = True

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
