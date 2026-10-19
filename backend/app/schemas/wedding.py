from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict


class WeddingDateUpdate(BaseModel):
    wedding_date: date


class DDayResponse(BaseModel):
    wedding_date: Optional[date] = None
    d_day: Optional[int] = None
    label: Optional[str] = None
    status: Literal["NOT_SET", "UPCOMING", "TODAY", "PASSED"]
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
