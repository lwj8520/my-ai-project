from typing import List, Dict
from fastapi import APIRouter
from app.schemas.common import CategoryEnum, CATEGORY_LABELS

router = APIRouter(tags=["meta"])


@router.get("/categories", response_model=List[Dict[str, str]])
def get_categories():
    return [
        {"value": cat.value, "label": CATEGORY_LABELS[cat]}
        for cat in CategoryEnum
    ]


@router.get("/health")
def health_check():
    return {"status": "ok"}
