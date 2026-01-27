"""
모델 패키지
"""
from app.models.base import BaseModel
from app.models.user import User
from app.models.board import Board

__all__ = ["BaseModel", "User", "Board"]
