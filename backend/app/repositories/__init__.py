"""
Repository 패키지
"""
from app.repositories.user import UserRepository
from app.repositories.board import BoardRepository

__all__ = ["UserRepository", "BoardRepository"]
