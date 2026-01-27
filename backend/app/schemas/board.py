"""
Board 스키마 (게시판)
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class BoardBase(BaseModel):
    """게시글 기본 스키마"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=10000)


class BoardCreate(BoardBase):
    """게시글 생성 스키마"""
    pass


class BoardUpdate(BaseModel):
    """게시글 수정 스키마"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1, max_length=10000)


class BoardResponse(BaseModel):
    """게시글 응답 스키마"""
    id: int
    user_id: int
    title: str
    content: str
    view_count: int
    author_name: str
    is_author: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BoardListItem(BaseModel):
    """게시글 목록 아이템 스키마"""
    id: int
    title: str
    content: str  # 미리보기 (100자)
    view_count: int
    author_name: str
    created_at: datetime


class BoardListResponse(BaseModel):
    """게시글 목록 응답 스키마 (무한스크롤)"""
    items: List[BoardListItem]
    next_cursor: Optional[int] = None
    has_more: bool = False
