from enum import Enum
from typing import Dict


class CategoryEnum(str, Enum):
    VENUE = "VENUE"
    SDM = "SDM"
    HONEYMOON = "HONEYMOON"
    GIFT = "GIFT"
    HOME = "HOME"
    INVITATION = "INVITATION"
    ETC = "ETC"


CATEGORY_LABELS: Dict[CategoryEnum, str] = {
    CategoryEnum.VENUE: "예식장",
    CategoryEnum.SDM: "스드메",
    CategoryEnum.HONEYMOON: "신혼여행",
    CategoryEnum.GIFT: "예물/예단",
    CategoryEnum.HOME: "혼수/신혼집",
    CategoryEnum.INVITATION: "청첩장/하객",
    CategoryEnum.ETC: "기타",
}
