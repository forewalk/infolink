"""
User 모델
"""
from sqlalchemy import Column, String, Boolean

from app.models.base import BaseModel


class User(BaseModel):
    """
    사용자 모델

    Attributes:
        email: 이메일 (unique)
        hashed_password: 해시된 비밀번호
        username: 사용자 이름
        is_active: 활성화 여부
        is_admin: 관리자 여부
    """
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    username = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
