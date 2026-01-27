"""
Board 모델 (게시판)
"""
from sqlalchemy import Column, String, Text, Integer, BigInteger, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Board(BaseModel):
    """
    게시글 모델

    Attributes:
        user_id: 작성자 ID (FK)
        title: 게시글 제목 (최대 200자)
        content: 게시글 내용 (최대 10,000자)
        view_count: 조회수
    """
    __tablename__ = "boards"

    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    view_count = Column(Integer, nullable=False, default=0)

    # 관계 설정
    user = relationship("User", backref="boards")
