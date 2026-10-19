from datetime import date
from typing import Optional
from sqlalchemy.orm import Session
from app.models import WeddingSetting
from app.schemas.wedding import DDayResponse
from app.core.clock import today_kst, now_kst


def compute_dday(wedding_date: Optional[date], today: Optional[date] = None) -> dict:
    if wedding_date is None:
        return {
            "wedding_date": None,
            "d_day": None,
            "label": None,
            "status": "NOT_SET",
        }

    current_date = today or today_kst()
    diff = (wedding_date - current_date).days

    if diff > 0:
        return {
            "wedding_date": wedding_date,
            "d_day": diff,
            "label": f"D-{diff}",
            "status": "UPCOMING",
        }
    elif diff == 0:
        return {
            "wedding_date": wedding_date,
            "d_day": 0,
            "label": "D-Day",
            "status": "TODAY",
        }
    else:
        return {
            "wedding_date": wedding_date,
            "d_day": diff,
            "label": f"D+{-diff}",
            "status": "PASSED",
        }


def get_setting(db: Session) -> Optional[WeddingSetting]:
    return db.query(WeddingSetting).filter(WeddingSetting.id == 1).first()


def get_dday_response(db: Session, today: Optional[date] = None) -> DDayResponse:
    setting = get_setting(db)
    if not setting or setting.wedding_date is None:
        return DDayResponse(
            wedding_date=None,
            d_day=None,
            label=None,
            status="NOT_SET",
            updated_at=setting.updated_at if setting else None,
        )

    calculated = compute_dday(setting.wedding_date, today=today)
    return DDayResponse(
        wedding_date=calculated["wedding_date"],
        d_day=calculated["d_day"],
        label=calculated["label"],
        status=calculated["status"],
        updated_at=setting.updated_at,
    )


def upsert_wedding_date(db: Session, wedding_date: date, today: Optional[date] = None) -> DDayResponse:
    setting = get_setting(db)
    current_now = now_kst()

    if not setting:
        setting = WeddingSetting(
            id=1,
            wedding_date=wedding_date,
            created_at=current_now,
            updated_at=current_now,
        )
        db.add(setting)
    else:
        setting.wedding_date = wedding_date
        setting.updated_at = current_now

    db.commit()
    db.refresh(setting)

    calculated = compute_dday(setting.wedding_date, today=today)
    return DDayResponse(
        wedding_date=calculated["wedding_date"],
        d_day=calculated["d_day"],
        label=calculated["label"],
        status=calculated["status"],
        updated_at=setting.updated_at,
    )


def clear_wedding_date(db: Session) -> None:
    setting = get_setting(db)
    if setting and setting.wedding_date is not None:
        setting.wedding_date = None
        setting.updated_at = now_kst()
        db.commit()
