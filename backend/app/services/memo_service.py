from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import WeddingMemo
from app.schemas.memo import MemoCreate, MemoUpdate, MemoResponse
from app.core.clock import now_kst
from app.core.exceptions import AppException


def _parse_tags(tags_str: Optional[str]) -> List[str]:
    if not tags_str:
        return []
    return [t.strip() for t in tags_str.split(",") if t.strip()]


def _serialize_tags(tags_list: Optional[List[str]]) -> Optional[str]:
    if not tags_list:
        return None
    return ",".join([t.strip().lstrip("#") for t in tags_list if t.strip()])


def to_response(memo: WeddingMemo) -> MemoResponse:
    return MemoResponse(
        id=memo.id,
        title=memo.title,
        memo_date=memo.memo_date,
        tags=_parse_tags(memo.tags),
        groom_content=memo.groom_content,
        bride_content=memo.bride_content,
        created_at=memo.created_at,
        updated_at=memo.updated_at,
    )


def list_memos(
    db: Session,
    tag: Optional[str] = None,
    q: Optional[str] = None,
) -> List[MemoResponse]:
    query = db.query(WeddingMemo)

    if tag and tag.strip():
        clean_tag = tag.strip().lstrip("#")
        query = query.filter(WeddingMemo.tags.ilike(f"%{clean_tag}%"))

    if q and q.strip():
        search_kw = f"%{q.strip()}%"
        query = query.filter(
            or_(
                WeddingMemo.title.ilike(search_kw),
                WeddingMemo.groom_content.ilike(search_kw),
                WeddingMemo.bride_content.ilike(search_kw),
            )
        )

    # 최신 날짜순 정렬
    query = query.order_by(WeddingMemo.memo_date.desc(), WeddingMemo.id.desc())
    memos = query.all()
    return [to_response(m) for m in memos]


def get_memo(db: Session, memo_id: int) -> WeddingMemo:
    memo = db.query(WeddingMemo).filter(WeddingMemo.id == memo_id).first()
    if not memo:
        raise AppException(
            status_code=404,
            code="MEMO_NOT_FOUND",
            message="존재하지 않는 메모입니다.",
        )
    return memo


def create_memo(db: Session, payload: MemoCreate) -> MemoResponse:
    current_now = now_kst()
    memo = WeddingMemo(
        title=payload.title,
        memo_date=payload.memo_date,
        tags=_serialize_tags(payload.tags),
        groom_content=payload.groom_content,
        bride_content=payload.bride_content,
        created_at=current_now,
        updated_at=current_now,
    )
    db.add(memo)
    db.commit()
    db.refresh(memo)
    return to_response(memo)


def update_memo(
    db: Session,
    memo_id: int,
    payload: MemoUpdate,
) -> MemoResponse:
    memo = get_memo(db, memo_id)
    data = payload.model_dump(exclude_unset=True)

    if "tags" in data:
        memo.tags = _serialize_tags(data["tags"])
        del data["tags"]

    for k, v in data.items():
        setattr(memo, k, v)

    memo.updated_at = now_kst()
    db.commit()
    db.refresh(memo)
    return to_response(memo)


def delete_memo(db: Session, memo_id: int) -> None:
    memo = get_memo(db, memo_id)
    db.delete(memo)
    db.commit()
