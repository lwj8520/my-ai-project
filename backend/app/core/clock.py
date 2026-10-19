from datetime import date, datetime
from zoneinfo import ZoneInfo
from app.core.config import settings


def get_timezone() -> ZoneInfo:
    return ZoneInfo(settings.TIMEZONE)


def now_kst() -> datetime:
    """Returns naive datetime in KST timezone."""
    return datetime.now(get_timezone()).replace(tzinfo=None)


def today_kst() -> date:
    """Returns today's date in KST timezone."""
    return datetime.now(get_timezone()).date()
