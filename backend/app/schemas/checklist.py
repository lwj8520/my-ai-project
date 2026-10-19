from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.common import CategoryEnum


class ChecklistItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="할 일 제목")
    category: CategoryEnum
    due_date: Optional[date] = None
    memo: Optional[str] = Field(None, max_length=500)

    @field_validator("title", mode="before")
    @classmethod
    def strip_and_validate_title(cls, v: str) -> str:
        if v is None:
            raise ValueError("title cannot be null")
        if isinstance(v, str):
            v_stripped = v.strip()
            if len(v_stripped) < 1:
                raise ValueError("title cannot be empty or whitespace only")
            return v_stripped
        return v


class ChecklistItemCreate(ChecklistItemBase):
    pass


class ChecklistItemUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[CategoryEnum] = None
    due_date: Optional[date] = None
    memo: Optional[str] = Field(None, max_length=500)
    is_completed: Optional[bool] = None

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

    @field_validator("category", "is_completed", mode="before")
    @classmethod
    def disallow_null_fields(cls, v: any, info):
        if v is None:
            raise ValueError(f"{info.field_name} cannot be null")
        return v


class ChecklistItemResponse(ChecklistItemBase):
    id: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    is_overdue: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryProgress(BaseModel):
    category: CategoryEnum
    label: str
    total: int
    completed: int
    progress_rate: float


class ChecklistSummaryResponse(BaseModel):
    total: int
    completed: int
    progress_rate: float
    by_category: List[CategoryProgress]
