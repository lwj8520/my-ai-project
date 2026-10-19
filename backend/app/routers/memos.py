from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.memo import MemoCreate, MemoUpdate, MemoResponse
from app.services import memo_service

router = APIRouter(prefix="/memos", tags=["memos"])


@router.get("", response_model=List[MemoResponse])
def get_memos(
    tag: Optional[str] = Query(None, description="태그 필터"),
    q: Optional[str] = Query(None, description="제목 및 내용 검색"),
    db: Session = Depends(get_db),
):
    return memo_service.list_memos(db, tag=tag, q=q)


@router.post("", response_model=MemoResponse, status_code=status.HTTP_201_CREATED)
def create_memo(
    payload: MemoCreate,
    response: Response,
    db: Session = Depends(get_db),
):
    created = memo_service.create_memo(db, payload)
    response.headers["Location"] = f"/api/v1/memos/{created.id}"
    return created


@router.get("/{id}", response_model=MemoResponse)
def get_memo(
    id: int,
    db: Session = Depends(get_db),
):
    memo = memo_service.get_memo(db, id)
    return memo_service.to_response(memo)


@router.patch("/{id}", response_model=MemoResponse)
def update_memo(
    id: int,
    payload: MemoUpdate,
    db: Session = Depends(get_db),
):
    return memo_service.update_memo(db, id, payload)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memo(
    id: int,
    db: Session = Depends(get_db),
):
    memo_service.delete_memo(db, id)
    return None
