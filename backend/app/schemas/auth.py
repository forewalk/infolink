"""
Auth 스키마
"""
from pydantic import BaseModel, EmailStr

from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    """로그인 요청 스키마"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """토큰 응답 스키마"""
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    """로그인 응답 스키마"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
