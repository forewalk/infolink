"""
스키마 패키지
"""
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse, LoginResponse
from app.schemas.board import (
    BoardBase,
    BoardCreate,
    BoardUpdate,
    BoardResponse,
    BoardListItem,
    BoardListResponse,
)

__all__ = [
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "LoginRequest",
    "TokenResponse",
    "LoginResponse",
    "BoardBase",
    "BoardCreate",
    "BoardUpdate",
    "BoardResponse",
    "BoardListItem",
    "BoardListResponse",
]
