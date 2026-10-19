from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import case
from app.models import ChecklistItem
from app.schemas.common import CategoryEnum, CATEGORY_LABELS
from app.schemas.checklist import (
    ChecklistItemCreate,
    ChecklistItemUpdate,
    ChecklistItemResponse,
    ChecklistSummaryResponse,
    CategoryProgress,
)
from app.core.clock import today_kst, now_kst
from app.core.exceptions import AppException
from app.seed.default_checklist import DEFAULT_CHECKLIST_ITEMS


def to_response(item: ChecklistItem, today: Optional[date] = None) -> ChecklistItemResponse:
    current_today = today or today_kst()
    is_overdue = bool(
        item.due_date is not None
        and item.due_date < current_today
        and not item.is_completed
    )
    return ChecklistItemResponse(
        id=item.id,
        title=item.title,
        category=CategoryEnum(item.category),
        due_date=item.due_date,
        memo=item.memo,
        is_completed=item.is_completed,
        completed_at=item.completed_at,
        is_overdue=is_overdue,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


def list_items(
    db: Session,
    category: Optional[CategoryEnum] = None,
    is_completed: Optional[bool] = None,
    q: Optional[str] = None,
    today: Optional[date] = None,
) -> List[ChecklistItemResponse]:
    query = db.query(ChecklistItem)

    if category is not None:
        query = query.filter(ChecklistItem.category == category.value)
    if is_completed is not None:
        query = query.filter(ChecklistItem.is_completed == is_completed)
    if q is not None and q.strip():
        query = query.filter(ChecklistItem.title.ilike(f"%{q.strip()}%"))

    # BR-5: is_completed ASC, due_date is null last, due_date ASC, created_at ASC, id ASC
    null_due_date = case((ChecklistItem.due_date.is_(None), 1), else_=0)
    query = query.order_by(
        ChecklistItem.is_completed.asc(),
        null_due_date.asc(),
        ChecklistItem.due_date.asc(),
        ChecklistItem.created_at.asc(),
        ChecklistItem.id.asc(),
    )

    items = query.all()
    return [to_response(item, today=today) for item in items]


def get_item(db: Session, item_id: int) -> ChecklistItem:
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise AppException(status_code=404, code="CHECKLIST_NOT_FOUND", message="존재하지 않는 체크리스트 항목입니다.")
    return item


def create_item(
    db: Session,
    payload: ChecklistItemCreate,
    today: Optional[date] = None,
) -> ChecklistItemResponse:
    current_now = now_kst()
    item = ChecklistItem(
        title=payload.title,
        category=payload.category.value,
        due_date=payload.due_date,
        memo=payload.memo,
        is_completed=False,
        completed_at=None,
        created_at=current_now,
        updated_at=current_now,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return to_response(item, today=today)


def update_item(
    db: Session,
    item_id: int,
    payload: ChecklistItemUpdate,
    today: Optional[date] = None,
) -> ChecklistItemResponse:
    item = get_item(db, item_id)
    data = payload.model_dump(exclude_unset=True)

    # BR-1: is_completed transition
    if "is_completed" in data:
        next_completed = data["is_completed"]
        if next_completed != item.is_completed:
            item.is_completed = next_completed
            item.completed_at = now_kst() if next_completed else None
        del data["is_completed"]

    if "category" in data:
        item.category = data["category"].value if data["category"] else item.category
        del data["category"]

    for k, v in data.items():
        setattr(item, k, v)

    item.updated_at = now_kst()
    db.commit()
    db.refresh(item)
    return to_response(item, today=today)


def delete_item(db: Session, item_id: int) -> None:
    item = get_item(db, item_id)
    db.delete(item)
    db.commit()


def get_summary(db: Session) -> ChecklistSummaryResponse:
    items = db.query(ChecklistItem).all()
    total = len(items)
    completed = sum(1 for i in items if i.is_completed)
    progress_rate = round((completed / total * 100), 1) if total > 0 else 0.0

    by_category: List[CategoryProgress] = []
    for cat in CategoryEnum:
        cat_items = [i for i in items if i.category == cat.value]
        cat_total = len(cat_items)
        cat_completed = sum(1 for i in cat_items if i.is_completed)
        cat_rate = round((cat_completed / cat_total * 100), 1) if cat_total > 0 else 0.0
        by_category.append(
            CategoryProgress(
                category=cat,
                label=CATEGORY_LABELS[cat],
                total=cat_total,
                completed=cat_completed,
                progress_rate=cat_rate,
            )
        )

    return ChecklistSummaryResponse(
        total=total,
        completed=completed,
        progress_rate=progress_rate,
        by_category=by_category,
    )


def seed_defaults(db: Session) -> int:
    existing_count = db.query(ChecklistItem).count()
    if existing_count > 0:
        raise AppException(
            status_code=409,
            code="SEED_ALREADY_APPLIED",
            message="이미 체크리스트 항목이 존재합니다.",
        )

    current_now = now_kst()
    new_items = [
        ChecklistItem(
            title=item_data["title"],
            category=item_data["category"].value,
            due_date=None,
            memo=None,
            is_completed=False,
            completed_at=None,
            created_at=current_now,
            updated_at=current_now,
        )
        for item_data in DEFAULT_CHECKLIST_ITEMS
    ]
    db.add_all(new_items)
    db.commit()
    return len(new_items)
