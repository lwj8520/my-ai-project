from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, func
from app.database import Base


class WeddingSetting(Base):
    __tablename__ = "wedding_settings"

    id = Column(Integer, primary_key=True)
    wedding_date = Column(Date, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    category = Column(String(20), nullable=False, index=True)
    is_completed = Column(Boolean, nullable=False, default=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    due_date = Column(Date, nullable=True)
    memo = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class WeddingMemo(Base):
    __tablename__ = "wedding_memos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    memo_date = Column(Date, nullable=False)
    tags = Column(String(255), nullable=True)  # Comma-separated tags e.g. "스드메,드레스투어"
    groom_content = Column(String, nullable=True)  # 신랑 마크다운 메모
    bride_content = Column(String, nullable=True)  # 신부 마크다운 메모
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

