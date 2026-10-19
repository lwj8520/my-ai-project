from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.common import CategoryEnum
from app.schemas.checklist import (
    ChecklistItemCreate,
    ChecklistItemUpdate,
    ChecklistItemResponse,
    ChecklistSummaryResponse,
)
from app.services import checklist_service

router = APIRouter(prefix="/checklists", tags=["checklists"])


@router.get("/summary", response_model=ChecklistSummaryResponse)
def get_summary(db: Session = Depends(get_db)):
    return checklist_service.get_summary(db)


@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_defaults(db: Session = Depends(get_db)):
    count = checklist_service.seed_defaults(db)
    return {"inserted": count}


@router.get("", response_model=List[ChecklistItemResponse])
def get_checklists(
    category: Optional[CategoryEnum] = Query(None, description="카테고리 필터"),
    is_completed: Optional[bool] = Query(None, description="완료 여부 필터"),
    q: Optional[str] = Query(None, description="검색어"),
    db: Session = Depends(get_db),
):
    return checklist_service.list_items(db, category=category, is_completed=is_completed, q=q)


@router.post("", response_model=ChecklistItemResponse, status_code=status.HTTP_201_CREATED)
def create_checklist_item(
    payload: ChecklistItemCreate,
    response: Response,
    db: Session = Depends(get_db),
):
    created = checklist_service.create_item(db, payload)
    response.headers["Location"] = f"/api/v1/checklists/{created.id}"
    return created


@router.get("/{id}", response_model=ChecklistItemResponse)
def get_checklist_item(
    id: int,
    db: Session = Depends(get_db),
):
    item = checklist_service.get_item(db, id)
    return checklist_service.to_response(item)


@router.patch("/{id}", response_model=ChecklistItemResponse)
def update_checklist_item(
    id: int,
    payload: ChecklistItemUpdate,
    db: Session = Depends(get_db),
):
    return checklist_service.update_item(db, id, payload)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checklist_item(
    id: int,
    db: Session = Depends(get_db),
):
    checklist_service.delete_item(db, id)
    return None
