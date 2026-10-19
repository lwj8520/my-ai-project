from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    unhandled_exception_handler,
)
from app.database import engine, Base, SessionLocal
from app.models import WeddingSetting, ChecklistItem
from app.routers import settings as settings_router
from app.routers import checklists as checklists_router
from app.routers import meta as meta_router
from app.routers import memos as memos_router
from app.services import checklist_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. DB 테이블 생성
    Base.metadata.create_all(bind=engine)

    # 2. 최초 1회 시드 삽입 (D9)
    db = SessionLocal()
    try:
        settings_count = db.query(WeddingSetting).count()
        items_count = db.query(ChecklistItem).count()
        if settings_count == 0 and items_count == 0:
            checklist_service.seed_defaults(db)
    except Exception:
        pass
    finally:
        db.close()

    yield


app = FastAPI(
    title="Wedding Planner API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정 (NFR-7)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 예외 핸들러 등록
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# 라우터 등록 (/api/v1)
api_v1_router = FastAPI()
app.include_router(settings_router.router, prefix="/api/v1")
app.include_router(checklists_router.router, prefix="/api/v1")
app.include_router(meta_router.router, prefix="/api/v1")
app.include_router(memos_router.router, prefix="/api/v1")
