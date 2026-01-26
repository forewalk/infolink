"""
공통 유틸리티 함수
"""
from typing import Optional
from datetime import datetime


def is_soft_deleted(deleted_at: Optional[datetime]) -> bool:
    """
    Soft Delete 여부 확인

    Args:
        deleted_at: 삭제 시각

    Returns:
        bool: Soft Delete 여부
    """
    return deleted_at is not None


def format_datetime(dt: datetime) -> str:
    """
    datetime을 ISO 8601 형식 문자열로 변환

    Args:
        dt: datetime 객체

    Returns:
        str: ISO 8601 형식 문자열
    """
    return dt.isoformat()
