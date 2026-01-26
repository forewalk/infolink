"""
User 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """사용자 기본 스키마"""
    email: EmailStr
    username: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """사용자 생성 스키마"""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """사용자 수정 스키마"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=6)
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class UserResponse(UserBase):
    """사용자 응답 스키마"""
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
