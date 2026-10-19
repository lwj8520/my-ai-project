from typing import List, Dict
from app.schemas.common import CategoryEnum

DEFAULT_CHECKLIST_ITEMS: List[Dict[str, str]] = [
    # 예식장 (4개)
    {"category": CategoryEnum.VENUE, "title": "예식장 후보 리스트업"},
    {"category": CategoryEnum.VENUE, "title": "예식장 투어 예약"},
    {"category": CategoryEnum.VENUE, "title": "예식장 계약 및 계약금 납부"},
    {"category": CategoryEnum.VENUE, "title": "식전/식후 영상 및 식순 확정"},
    # 스드메 (4개)
    {"category": CategoryEnum.SDM, "title": "웨딩플래너/업체 선정"},
    {"category": CategoryEnum.SDM, "title": "스튜디오 촬영 예약"},
    {"category": CategoryEnum.SDM, "title": "드레스 투어 및 피팅"},
    {"category": CategoryEnum.SDM, "title": "메이크업 리허설"},
    # 신혼여행 (4개)
    {"category": CategoryEnum.HONEYMOON, "title": "여행지/일정 결정"},
    {"category": CategoryEnum.HONEYMOON, "title": "항공권 예약"},
    {"category": CategoryEnum.HONEYMOON, "title": "숙소 예약"},
    {"category": CategoryEnum.HONEYMOON, "title": "여권 유효기간 확인"},
    # 예물/예단 (3개)
    {"category": CategoryEnum.GIFT, "title": "예물 쇼핑"},
    {"category": CategoryEnum.GIFT, "title": "한복 대여/맞춤"},
    {"category": CategoryEnum.GIFT, "title": "웨딩 밴드(반지) 수령"},
    # 혼수/신혼집 (2개)
    {"category": CategoryEnum.HOME, "title": "신혼집 계약"},
    {"category": CategoryEnum.HOME, "title": "가전/가구 구매"},
    # 청첩장/하객 (3개)
    {"category": CategoryEnum.INVITATION, "title": "청첩장 디자인 선택 및 주문"},
    {"category": CategoryEnum.INVITATION, "title": "모바일 청첩장 제작"},
    {"category": CategoryEnum.INVITATION, "title": "하객 명단 정리"},
]
