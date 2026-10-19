from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.wedding import DDayResponse, WeddingDateUpdate
from app.services import dday_service

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/d-day", response_model=DDayResponse)
def get_dday(db: Session = Depends(get_db)):
    return dday_service.get_dday_response(db)


@router.put("/wedding-date", response_model=DDayResponse)
def update_wedding_date(
    payload: WeddingDateUpdate,
    db: Session = Depends(get_db),
):
    return dday_service.upsert_wedding_date(db, wedding_date=payload.wedding_date)


@router.delete("/wedding-date", status_code=status.HTTP_204_NO_CONTENT)
def delete_wedding_date(db: Session = Depends(get_db)):
    dday_service.clear_wedding_date(db)
    return None
