from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class MemoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, description="메모 제목")
    memo_date: date = Field(..., description="메모 날짜")
    tags: List[str] = Field(default_factory=list, description="태그 목록")
    groom_content: Optional[str] = Field(None, description="신랑 작성 마크다운 내용")
    bride_content: Optional[str] = Field(None, description="신부 작성 마크다운 내용")

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, v: str) -> str:
        if v is None:
            raise ValueError("title cannot be null")
        if isinstance(v, str):
            v_stripped = v.strip()
            if len(v_stripped) < 1:
                raise ValueError("title cannot be empty or whitespace only")
            return v_stripped
        return v

    @field_validator("tags", mode="before")
    @classmethod
    def clean_tags(cls, v: any) -> List[str]:
        if v is None:
            return []
        if isinstance(v, str):
            return [t.strip().lstrip("#") for t in v.split(",") if t.strip()]
        if isinstance(v, list):
            return [str(t).strip().lstrip("#") for t in v if str(t).strip()]
        return v


class MemoCreate(MemoBase):
    pass


class MemoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    memo_date: Optional[date] = None
    tags: Optional[List[str]] = None
    groom_content: Optional[str] = None
    bride_content: Optional[str] = None

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            raise ValueError("title cannot be null")
        if isinstance(v, str):
            v_stripped = v.strip()
            if len(v_stripped) < 1:
                raise ValueError("title cannot be empty or whitespace only")
            return v_stripped
        return v

    @field_validator("tags", mode="before")
    @classmethod
    def clean_tags(cls, v: any) -> Optional[List[str]]:
        if v is None:
            return None
        if isinstance(v, str):
            return [t.strip().lstrip("#") for t in v.split(",") if t.strip()]
        if isinstance(v, list):
            return [str(t).strip().lstrip("#") for t in v if str(t).strip()]
        return v


class MemoResponse(MemoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
