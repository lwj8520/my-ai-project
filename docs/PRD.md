# PRD: 결혼 준비 D-Day 및 필수 체크리스트 관리 기능

| 항목 | 내용 |
|---|---|
| **문서 버전** | v1.0 (Draft) |
| **관련 이슈** | #1 `feat: 결혼 준비 D-Day 및 필수 체크리스트 관리 기능 구현` |
| **작성자(이슈 등록)** | lwj8520 (GENIE) |
| **상태** | Draft / 리뷰 대기 |
| **기술 스택** | Backend: FastAPI / Frontend: Next.js + TailwindCSS |

> **문서 작성 원칙**
> 이슈에 명시된 요구사항은 **[필수]**로, 이슈에는 없지만 구현을 위해 보완한 사항은 **[제안]**으로 표기했습니다. [제안] 항목은 리뷰 과정에서 확정하거나 제외할 수 있습니다.

---

## 1. 프로젝트 개요 및 핵심 목표

### 1.1 배경
결혼 준비는 예식장 예약, 스드메(스튜디오/드레스/메이크업), 신혼여행 등 해야 할 일이 많고 시점도 제각각입니다. 예비 부부가 메신저, 메모장, 엑셀에 흩어 관리하다 보면 진행 상황을 놓치기 쉽습니다. 결혼식까지 남은 기간과 해야 할 일을 한 화면에서 보여 주는 웹 페이지가 필요합니다.

### 1.2 제품 비전
> "결혼식까지 며칠 남았는지, 지금 무엇을 해야 하는지 한눈에 보여주는 결혼 준비 대시보드"

### 1.3 핵심 목표 (Goals)

| # | 목표 | 구분 |
|---|---|---|
| G1 | 결혼식 날짜를 설정하면 **D-Day**를 메인 화면 상단에 표시한다. | [필수] |
| G2 | **카테고리별 체크리스트**를 조회, 추가, 완료 처리할 수 있다 (CRUD). | [필수] |
| G3 | FastAPI 기반 REST API로 D-Day 설정과 체크리스트를 제공한다. | [필수] |
| G4 | Next.js + TailwindCSS 기반의 깔끔하고 직관적인 UI를 제공한다. | [필수] |
| G5 | 카테고리별/전체 진행률을 시각화한다. | [제안] |

### 1.4 성공 지표 (Success Metrics)

| 지표 | 목표 |
|---|---|
| 결혼식 날짜 설정까지 소요 시간 | 첫 방문 후 30초 이내 |
| 체크리스트 항목 추가/완료 처리 | 각 2회 이하의 클릭/탭 |
| 메인 화면 초기 로딩 (LCP) | 2.5초 이내 |
| API 평균 응답 시간 (p95) | 200ms 이하 (로컬/단일 인스턴스 기준) |

### 1.5 범위 (Scope)

**In Scope (MVP)**
- 결혼식 날짜 설정/수정/삭제와 D-Day 표시
- 체크리스트 항목의 조회/추가/수정/삭제/완료 토글
- 카테고리별 그룹핑과 필터링
- 진행률 요약
- 반응형 웹 (모바일/데스크톱)

**Out of Scope (MVP 이후 검토)**
- 회원가입/로그인, 멀티 유저, 배우자 간 공유/동기화
- 푸시/이메일 알림
- 예산 관리, 업체 정보 관리, 파일 첨부
- 다국어 지원 (MVP는 한국어 전용)
- 항목 드래그 앤 드롭 정렬

### 1.6 가정 및 제약 (Assumptions)

| # | 가정 |
|---|---|
| A1 | MVP는 **인증 없는 단일 사용자(단일 결혼 일정)** 모델이다. 이슈에 인증 요구사항이 없으므로 `wedding_settings`는 1개 레코드(싱글톤)로 관리한다. |
| A2 | D-Day 계산 기준 시간대는 **Asia/Seoul (KST)**이다. |
| A3 | 카테고리는 MVP에서 **고정 Enum**으로 제공하고, 사용자 정의 카테고리는 제외한다. |
| A4 | DB는 개발 편의상 **SQLite**(SQLAlchemy ORM)를 기본으로 하고, 추후 PostgreSQL로 교체 가능하게 설계한다. |

---

## 2. 유저 스토리 및 기능 요구사항

### 2.1 페르소나

| 항목 | 내용 |
|---|---|
| **이름** | 지은 (31세, 예비 신부) |
| **상황** | 결혼식 6개월 전, 직장 병행 중. 모바일과 PC를 번갈아 사용 |
| **Pain Point** | 해야 할 일이 여러 곳에 흩어져 있고, 남은 기간 대비 진행 상황을 가늠하기 어렵다 |
| **니즈** | 간단히 날짜를 입력하고, 할 일을 체크하며, 얼마나 준비했는지 보고 싶다 |

### 2.2 유저 스토리

#### Epic 1. D-Day 카운터

| ID | 유저 스토리 | 우선순위 |
|---|---|---|
| US-1.1 | 예비 부부로서, 결혼식 날짜를 설정해 남은 일수를 확인하고 싶다. | P0 |
| US-1.2 | 예비 부부로서, 메인 화면 상단에서 D-Day를 바로 보고 싶다. | P0 |
| US-1.3 | 예비 부부로서, 일정이 바뀌면 결혼식 날짜를 수정하고 싶다. | P0 |
| US-1.4 | 예비 부부로서, 결혼식 날짜를 아직 정하지 않았다면 날짜 설정을 안내받고 싶다. | P0 |
| US-1.5 | 예비 부부로서, 결혼식 날짜를 삭제(초기화)하고 싶다. | P2 |

#### Epic 2. 체크리스트 관리

| ID | 유저 스토리 | 우선순위 |
|---|---|---|
| US-2.1 | 예비 부부로서, 예식장/스드메/신혼여행 등 카테고리별로 체크리스트를 보고 싶다. | P0 |
| US-2.2 | 예비 부부로서, 카테고리를 선택해 새 체크리스트 항목을 추가하고 싶다. | P0 |
| US-2.3 | 예비 부부로서, 완료한 항목을 체크해 완료 처리하고, 실수 시 되돌리고 싶다. | P0 |
| US-2.4 | 예비 부부로서, 항목 제목, 카테고리, 마감일, 메모를 수정하고 싶다. | P1 |
| US-2.5 | 예비 부부로서, 불필요한 항목을 삭제하고 싶다. | P1 |
| US-2.6 | 예비 부부로서, 미완료/완료 항목만 필터링해서 보고 싶다. | P1 |
| US-2.7 | 예비 부부로서, 전체 및 카테고리별 진행률을 보고 싶다. | P1 |
| US-2.8 | 처음 사용하는 예비 부부로서, 기본 필수 체크리스트가 미리 채워져 있길 원한다. | P1 |

### 2.3 기능 요구사항 (Functional Requirements)

#### FR-1. D-Day 카운터

| ID | 요구사항 | 구분 |
|---|---|---|
| FR-1.1 | 사용자는 결혼식 날짜(`YYYY-MM-DD`)를 설정할 수 있다. | [필수] |
| FR-1.2 | 메인 화면 상단 영역에 D-Day를 크게 표시한다. | [필수] |
| FR-1.3 | 표시 형식은 아래 규칙을 따른다. (아래 표 참조) | [필수] |
| FR-1.4 | 결혼식 날짜는 언제든 수정할 수 있다. | [필수] |
| FR-1.5 | 날짜 미설정 시 D-Day 영역에 "결혼식 날짜를 설정해 주세요" CTA를 표시한다. | [필수] |
| FR-1.6 | 과거 날짜도 설정할 수 있다 (`D+n` 표시). 단, 입력 시 확인 안내를 노출한다. | [제안] |
| FR-1.7 | 결혼식 날짜를 삭제(초기화)할 수 있다. | [제안] |
| FR-1.8 | D-Day 값은 서버가 KST 기준으로 계산해 반환하고, 클라이언트는 이를 표시한다. | [제안] |

**D-Day 표시 규칙**

| 조건 | 계산 | 표시 예시 |
|---|---|---|
| 결혼식 전 | `wedding_date - today > 0` | `D-128` |
| 결혼식 당일 | `= 0` | `D-Day` |
| 결혼식 이후 | `< 0` | `D+3` |
| 미설정 | - | 설정 유도 CTA |

#### FR-2. 체크리스트 관리

| ID | 요구사항 | 구분 |
|---|---|---|
| FR-2.1 | 항목은 카테고리에 속한다. MVP 카테고리: **예식장, 스드메, 신혼여행, 예물/예단, 혼수/신혼집, 청첩장/하객, 기타** | [필수] |
| FR-2.2 | 카테고리별로 그룹핑된 체크리스트 목록을 조회할 수 있다. | [필수] |
| FR-2.3 | 항목을 추가할 수 있다 (필수: 제목, 카테고리 / 선택: 마감일, 메모). | [필수] |
| FR-2.4 | 항목의 완료/미완료 상태를 토글할 수 있다. 완료 시각을 기록한다. | [필수] |
| FR-2.5 | 항목을 수정할 수 있다. | [제안] |
| FR-2.6 | 항목을 삭제할 수 있다 (삭제 전 확인). | [제안] |
| FR-2.7 | 카테고리/완료 여부로 필터링할 수 있다. | [제안] |
| FR-2.8 | 전체 및 카테고리별 진행률(`완료 수 / 전체 수`)을 표시한다. | [제안] |
| FR-2.9 | 완료 항목은 취소선과 흐린 색상으로 구분한다. | [제안] |
| FR-2.10 | 최초 실행 시 카테고리별 기본 체크리스트(시드 데이터)를 제공한다. (4.4 참고) | [제안] |
| FR-2.11 | 마감일이 지났는데 미완료인 항목은 "기한 초과"로 강조한다. | [제안] |

#### FR-3. 비기능 요구사항 (NFR)

| ID | 분류 | 요구사항 |
|---|---|---|
| NFR-1 | 성능 | 체크리스트 토글은 Optimistic UI로 즉시 반영하고, 실패 시 롤백한다. |
| NFR-2 | 반응형 | 360px(모바일)~1440px(데스크톱) 레이아웃 지원 |
| NFR-3 | 접근성 | 키보드 조작, 체크박스 `label` 연결, 명도 대비 WCAG AA 수준 |
| NFR-4 | 유효성 | 서버(Pydantic)와 클라이언트 양쪽에서 입력값 검증 |
| NFR-5 | 오류 처리 | 네트워크/서버 오류 시 사용자 친화적 메시지(토스트) 노출 |
| NFR-6 | 문서화 | FastAPI 자동 문서(`/docs`)로 API 스펙 제공 |
| NFR-7 | 보안 | CORS 허용 오리진 제한, 입력 길이 제한, SQL Injection 방지(ORM 사용) |
| NFR-8 | 테스트 | 백엔드 핵심 로직(D-Day 계산, CRUD) 단위/통합 테스트 작성 |

---

## 3. 데이터 모델 정의

### 3.1 ERD

```
┌──────────────────────────┐        ┌────────────────────────────────┐
│     wedding_settings     │        │        checklist_items         │
├──────────────────────────┤        ├────────────────────────────────┤
│ id            INT  PK    │        │ id            INT  PK          │
│ wedding_date  DATE NULL  │        │ title         VARCHAR(100)     │
│ created_at    DATETIME   │        │ category      VARCHAR(20)      │
│ updated_at    DATETIME   │        │ is_completed  BOOLEAN          │
└──────────────────────────┘        │ completed_at  DATETIME NULL    │
   (싱글톤: id = 1 고정)              │ due_date      DATE NULL        │
                                    │ memo          VARCHAR(500) NULL│
                                    │ created_at    DATETIME         │
                                    │ updated_at    DATETIME         │
                                    └────────────────────────────────┘
```

> MVP는 단일 사용자 가정이므로 두 테이블 간 FK가 없습니다. 멀티 유저로 확장할 때는 `user_id` 또는 `wedding_id`를 추가합니다.

### 3.2 DB 테이블 정의 (SQL 기준)

```sql
CREATE TABLE wedding_settings (
    id            INTEGER PRIMARY KEY,           -- 항상 1
    wedding_date  DATE,                          -- NULL = 미설정
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checklist_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         VARCHAR(100) NOT NULL,
    category      VARCHAR(20)  NOT NULL,         -- CategoryEnum 값
    is_completed  BOOLEAN      NOT NULL DEFAULT 0,
    completed_at  DATETIME,
    due_date      DATE,
    memo          VARCHAR(500),
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checklist_category     ON checklist_items(category);
CREATE INDEX idx_checklist_is_completed ON checklist_items(is_completed);
```

### 3.3 카테고리 Enum

| Enum 값 | 한글 라벨 | 설명 |
|---|---|---|
| `VENUE` | 예식장 | 예식장 투어/예약/계약 |
| `SDM` | 스드메 | 스튜디오/드레스/메이크업 |
| `HONEYMOON` | 신혼여행 | 항공/숙소/일정 |
| `GIFT` | 예물/예단 | 예물, 예단, 한복 등 |
| `HOME` | 혼수/신혼집 | 가전/가구/신혼집 |
| `INVITATION` | 청첩장/하객 | 청첩장 제작/배포, 하객 관리 |
| `ETC` | 기타 | 그 외 |

### 3.4 Pydantic 스키마

```python
# app/schemas/common.py
from enum import Enum

class CategoryEnum(str, Enum):
    VENUE = "VENUE"
    SDM = "SDM"
    HONEYMOON = "HONEYMOON"
    GIFT = "GIFT"
    HOME = "HOME"
    INVITATION = "INVITATION"
    ETC = "ETC"
```

```python
# app/schemas/wedding.py
from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class WeddingDateUpdate(BaseModel):
    wedding_date: date                       # 결혼식 날짜 (YYYY-MM-DD)

class DDayResponse(BaseModel):
    wedding_date: Optional[date] = None      # 미설정 시 null
    d_day: Optional[int] = None              # 양수: 남은 일수, 0: 당일, 음수: 경과 일수
    label: Optional[str] = None              # "D-128" | "D-Day" | "D+3"
    status: Literal["NOT_SET", "UPCOMING", "TODAY", "PASSED"]
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
```

```python
# app/schemas/checklist.py
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from .common import CategoryEnum

class ChecklistItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="할 일 제목")
    category: CategoryEnum
    due_date: Optional[date] = None
    memo: Optional[str] = Field(None, max_length=500)

class ChecklistItemCreate(ChecklistItemBase):
    pass

class ChecklistItemUpdate(BaseModel):          # PATCH: 모든 필드 optional
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[CategoryEnum] = None
    due_date: Optional[date] = None
    memo: Optional[str] = Field(None, max_length=500)
    is_completed: Optional[bool] = None

class ChecklistItemResponse(ChecklistItemBase):
    id: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    is_overdue: bool = False                   # due_date < today and not completed
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CategoryProgress(BaseModel):
    category: CategoryEnum
    label: str                                 # 한글 라벨
    total: int
    completed: int
    progress_rate: float                       # 0.0 ~ 100.0

class ChecklistSummaryResponse(BaseModel):
    total: int
    completed: int
    progress_rate: float
    by_category: list[CategoryProgress]
```

```python
# app/schemas/error.py
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    code: str          # e.g. "CHECKLIST_NOT_FOUND"
    message: str       # 사용자 노출 가능한 메시지
```

### 3.5 SQLAlchemy 모델 (참고)

```python
# app/models.py
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, func
from .database import Base

class WeddingSetting(Base):
    __tablename__ = "wedding_settings"
    id = Column(Integer, primary_key=True)          # 항상 1
    wedding_date = Column(Date, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    category = Column(String(20), nullable=False, index=True)
    is_completed = Column(Boolean, nullable=False, default=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    due_date = Column(Date, nullable=True)
    memo = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
```

### 3.6 비즈니스 규칙

| 규칙 | 내용 |
|---|---|
| BR-1 | `is_completed`가 `false → true`로 바뀌면 `completed_at = now()`, `true → false`면 `completed_at = null` |
| BR-2 | `is_overdue = (due_date is not None) and (due_date < today_kst) and (not is_completed)` |
| BR-3 | `title`은 앞뒤 공백을 제거한 뒤 1자 이상이어야 한다. |
| BR-4 | D-Day = `(wedding_date - today_kst).days` |
| BR-5 | 목록 기본 정렬: 미완료 우선 → `due_date` 오름차순(NULL은 마지막) → `created_at` 오름차순 |

### 3.7 시드 데이터 (기본 체크리스트) [제안]

| 카테고리 | 기본 항목 |
|---|---|
| 예식장 | 예식장 후보 리스트업, 예식장 투어 예약, 예식장 계약 및 계약금 납부, 식전/식후 영상 및 식순 확정 |
| 스드메 | 웨딩플래너/업체 선정, 스튜디오 촬영 예약, 드레스 투어 및 피팅, 메이크업 리허설 |
| 신혼여행 | 여행지/일정 결정, 항공권 예약, 숙소 예약, 여권 유효기간 확인 |
| 예물/예단 | 예물 쇼핑, 한복 대여/맞춤 |
| 혼수/신혼집 | 신혼집 계약, 가전/가구 구매 |
| 청첩장/하객 | 청첩장 디자인 선택 및 주문, 하객 명단 정리 |

> 시드는 DB 초기화 시 1회만 삽입합니다. `POST /api/v1/checklists/seed`로도 수동 삽입할 수 있고, 항목이 이미 있으면 거부합니다.

---

## 4. RESTful API 엔드포인트 설계

### 4.1 공통 규칙

| 항목 | 내용 |
|---|---|
| **Base URL** | `/api/v1` |
| **Content-Type** | `application/json; charset=utf-8` |
| **날짜 형식** | `YYYY-MM-DD` (date), ISO 8601 (datetime) |
| **인증** | MVP 없음 (A1) |
| **CORS** | 프론트엔드 오리진만 허용 (`http://localhost:3000` 등) |
| **오류 응답** | `{ "code": "...", "message": "..." }`, 검증 오류는 FastAPI 기본 `422` 형식 유지 |

### 4.2 엔드포인트 요약

| 그룹 | Method | Endpoint | 설명 | 구분 |
|---|---|---|---|---|
| D-Day | `GET` | `/settings/d-day` | 결혼식 날짜 및 D-Day 조회 | [필수] |
| D-Day | `PUT` | `/settings/wedding-date` | 결혼식 날짜 설정/수정 | [필수] |
| D-Day | `DELETE` | `/settings/wedding-date` | 결혼식 날짜 초기화 | [제안] |
| Checklist | `GET` | `/checklists` | 목록 조회 (필터 지원) | [필수] |
| Checklist | `POST` | `/checklists` | 항목 추가 | [필수] |
| Checklist | `GET` | `/checklists/{id}` | 단건 조회 | [제안] |
| Checklist | `PATCH` | `/checklists/{id}` | 항목 수정 / 완료 처리 | [필수] |
| Checklist | `DELETE` | `/checklists/{id}` | 항목 삭제 | [제안] |
| Checklist | `GET` | `/checklists/summary` | 진행률 요약 | [제안] |
| Checklist | `POST` | `/checklists/seed` | 기본 체크리스트 삽입 | [제안] |
| Meta | `GET` | `/categories` | 카테고리 목록(값/라벨) | [제안] |
| Meta | `GET` | `/health` | 헬스 체크 | [제안] |

> `GET /checklists/summary`와 `GET /checklists/{id}`가 충돌하지 않도록, FastAPI에서 `/summary` 라우트를 `/{id}`보다 먼저 선언하거나 `id`를 `int`로 타입 지정합니다.

### 4.3 상세 명세

#### 4.3.1 D-Day

**`GET /api/v1/settings/d-day`**

- 200 OK (설정됨)

```json
{
  "wedding_date": "2026-10-17",
  "d_day": 128,
  "label": "D-128",
  "status": "UPCOMING",
  "updated_at": "2026-06-11T09:30:00"
}
```

- 200 OK (미설정)

```json
{
  "wedding_date": null,
  "d_day": null,
  "label": null,
  "status": "NOT_SET",
  "updated_at": null
}
```

**`PUT /api/v1/settings/wedding-date`**

- Request

```json
{ "wedding_date": "2026-10-17" }
```

- 200 OK: `DDayResponse`와 동일
- 422: 날짜 형식 오류

**`DELETE /api/v1/settings/wedding-date`**

- 204 No Content (멱등, 이미 미설정이어도 204)

#### 4.3.2 체크리스트

**`GET /api/v1/checklists`**

| Query | 타입 | 필수 | 설명 |
|---|---|---|---|
| `category` | `CategoryEnum` | N | 특정 카테고리만 조회 |
| `is_completed` | `bool` | N | 완료 여부 필터 |
| `q` | `string` | N | 제목 검색 (부분 일치) [제안] |

- 200 OK: `ChecklistItemResponse[]` (정렬은 BR-5)

```json
[
  {
    "id": 1,
    "title": "예식장 투어 예약",
    "category": "VENUE",
    "due_date": "2026-07-01",
    "memo": "주말 오전 선호",
    "is_completed": false,
    "completed_at": null,
    "is_overdue": false,
    "created_at": "2026-06-11T09:00:00",
    "updated_at": "2026-06-11T09:00:00"
  }
]
```

**`POST /api/v1/checklists`**

- Request: `ChecklistItemCreate`

```json
{
  "title": "드레스 투어 예약",
  "category": "SDM",
  "due_date": "2026-07-15",
  "memo": null
}
```

- 201 Created: `ChecklistItemResponse` (`Location: /api/v1/checklists/{id}` 헤더 포함)
- 422: 제목 누락/길이 초과/잘못된 카테고리

**`PATCH /api/v1/checklists/{id}`**

- 완료 처리 예시

```json
{ "is_completed": true }
```

- 200 OK: 갱신된 `ChecklistItemResponse` (BR-1에 따라 `completed_at` 설정)
- 404: `{"code": "CHECKLIST_NOT_FOUND", "message": "체크리스트 항목을 찾을 수 없습니다."}`
- 422: 유효성 오류

**`DELETE /api/v1/checklists/{id}`**

- 204 No Content / 404

**`GET /api/v1/checklists/summary`**

```json
{
  "total": 20,
  "completed": 6,
  "progress_rate": 30.0,
  "by_category": [
    { "category": "VENUE", "label": "예식장", "total": 4, "completed": 2, "progress_rate": 50.0 },
    { "category": "SDM", "label": "스드메", "total": 4, "completed": 1, "progress_rate": 25.0 }
  ]
}
```

**`POST /api/v1/checklists/seed`**

- 201 Created: 삽입된 항목 수 `{ "inserted": 20 }`
- 409 Conflict: 이미 항목이 있는 경우 `SEED_ALREADY_APPLIED`

**`GET /api/v1/categories`**

```json
[
  { "value": "VENUE", "label": "예식장" },
  { "value": "SDM", "label": "스드메" },
  { "value": "HONEYMOON", "label": "신혼여행" }
]
```

### 4.4 오류 코드 정의

| HTTP | code | 상황 |
|---|---|---|
| 404 | `CHECKLIST_NOT_FOUND` | 존재하지 않는 항목 ID |
| 409 | `SEED_ALREADY_APPLIED` | 시드 중복 삽입 시도 |
| 422 | (FastAPI 기본) | 요청 본문/쿼리 검증 실패 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 내부 오류 |

### 4.5 백엔드 디렉터리 구조

```
backend/
├── app/
│   ├── main.py                 # FastAPI 앱, CORS, 라우터 등록, lifespan(DB 초기화/시드)
│   ├── core/
│   │   ├── config.py           # 환경변수(DB URL, CORS origins, TZ)
│   │   └── exceptions.py       # 커스텀 예외 및 핸들러
│   ├── database.py             # engine, SessionLocal, Base, get_db
│   ├── models.py               # SQLAlchemy 모델
│   ├── schemas/
│   │   ├── common.py
│   │   ├── wedding.py
│   │   ├── checklist.py
│   │   └── error.py
│   ├── routers/
│   │   ├── settings.py         # /settings/*
│   │   ├── checklists.py       # /checklists/*
│   │   └── meta.py             # /categories, /health
│   ├── services/
│   │   ├── dday_service.py     # D-Day 계산 (KST)
│   │   └── checklist_service.py
│   └── seed/default_checklist.py
├── tests/
│   ├── test_dday.py
│   └── test_checklists.py
├── requirements.txt            # fastapi, uvicorn, sqlalchemy, pydantic, pytest, httpx
└── .env.example
```

---

## 5. 프론트엔드 컴포넌트 구조 및 UI 레이아웃

### 5.1 기술 스택 및 가이드

| 항목 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router), TypeScript |
| 스타일 | TailwindCSS |
| 서버 상태 관리 | TanStack Query (React Query) 또는 SWR: 캐싱, Optimistic Update 용도 |
| 폼 | React Hook Form + Zod (선택) |
| 아이콘 | lucide-react (선택) |
| API 통신 | `fetch` 래퍼 (`lib/api.ts`), `NEXT_PUBLIC_API_BASE_URL` 환경변수 |

**디자인 톤 [제안]**: 따뜻하고 깔끔한 웨딩 무드의 포인트 컬러(로즈/핑크 계열), 흰색/연한 회색 배경, 충분한 여백과 둥근 카드(`rounded-2xl`).

### 5.2 페이지 구성

| 경로 | 설명 |
|---|---|
| `/` | 메인 대시보드 (D-Day 배너 + 진행률 + 카테고리별 체크리스트). MVP는 이 단일 페이지로 구성한다. |

### 5.3 UI 레이아웃 (와이어프레임)

#### 데스크톱 (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────┐
│  💍 Wedding Planner                                               │  ← Header
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                      D-128                                 │  │  ← DDayBanner
│  │               2026년 10월 17일 (토)                         │  │
│  │                              [ 날짜 수정 ✎ ]               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  전체 진행률  ██████░░░░░░░░░░  30% (6/20)                         │  ← ProgressSummary
│                                                                  │
│  [전체] [예식장] [스드메] [신혼여행] [예물/예단] [혼수] [청첩장] [기타] │  ← CategoryTabs
│  상태: (•)전체 ( )미완료 ( )완료                  [ + 항목 추가 ]    │  ← FilterBar
│                                                                  │
│  ┌─ 예식장  2/4 ────────────────────────────────────────────┐    │
│  │ ☑ ~~예식장 후보 리스트업~~                                 │    │  ← ChecklistSection
│  │ ☑ ~~예식장 투어 예약~~                                     │    │
│  │ ☐ 예식장 계약 및 계약금 납부        📅 7/1     ✎  🗑      │    │  ← ChecklistItem
│  │ ☐ 식전/식후 영상 및 식순 확정        ⚠ 기한 초과  ✎  🗑   │    │
│  │ [ + 이 카테고리에 추가 ]                                   │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌─ 스드메  1/4 ────────────────────────────────────────────┐    │
│  │ ...                                                      │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

#### 모바일 (< 640px)

```
┌────────────────────────┐
│ 💍 Wedding Planner      │
├────────────────────────┤
│        D-128           │
│   2026.10.17 (토)       │
│      [날짜 수정]         │
├────────────────────────┤
│ 진행률 ██████░░ 30%     │
├────────────────────────┤
│ [전체][예식장][스드메]→  │  ← 가로 스크롤 탭
├────────────────────────┤
│ ▼ 예식장 (2/4)          │  ← 아코디언
│  ☑ ~~예식장 후보~~       │
│  ☐ 예식장 계약           │
├────────────────────────┤
│ ▶ 스드메 (1/4)          │
│                    (＋) │  ← FAB: 항목 추가
└────────────────────────┘
```

### 5.4 화면 상태 정의

| 영역 | 상태 | UI |
|---|---|---|
| D-Day | 로딩 | 스켈레톤 |
| D-Day | 미설정 | "결혼식 날짜를 설정해 주세요" 안내와 `[날짜 설정]` 버튼 |
| D-Day | 설정됨 | `D-128`, 날짜, `[날짜 수정]` |
| D-Day | 당일 | `D-Day 🎉` 강조 스타일 |
| D-Day | 경과 | `D+3` |
| 체크리스트 | 로딩 | 리스트 스켈레톤 |
| 체크리스트 | 비어 있음 | "아직 등록된 할 일이 없어요" + `[기본 체크리스트 불러오기]`, `[직접 추가]` |
| 체크리스트 | 필터 결과 없음 | "조건에 맞는 항목이 없어요" |
| 공통 | 오류 | 토스트 + 재시도 버튼 |

### 5.5 컴포넌트 구조

```
src/
├── app/
│   ├── layout.tsx                  # 전역 레이아웃, Provider(QueryClient), 폰트
│   ├── page.tsx                    # 메인 대시보드
│   └── globals.css                 # Tailwind directives
├── components/
│   ├── layout/
│   │   └── Header.tsx
│   ├── dday/
│   │   ├── DDayBanner.tsx          # D-Day 표시, 미설정 CTA
│   │   └── WeddingDateModal.tsx    # 날짜 설정/수정 모달 (input type="date")
│   ├── checklist/
│   │   ├── ProgressSummary.tsx     # 전체/카테고리 진행률 바
│   │   ├── CategoryTabs.tsx        # 카테고리 탭 (가로 스크롤)
│   │   ├── FilterBar.tsx           # 완료 여부 필터, 추가 버튼
│   │   ├── ChecklistBoard.tsx      # 섹션 목록 컨테이너 (데이터 fetch/그룹핑)
│   │   ├── ChecklistSection.tsx    # 카테고리별 섹션(헤더+아이템 리스트)
│   │   ├── ChecklistItem.tsx       # 체크박스, 제목, 마감일, 수정/삭제
│   │   ├── ChecklistFormModal.tsx  # 추가/수정 폼 모달
│   │   └── EmptyState.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Checkbox.tsx
│       ├── ProgressBar.tsx
│       ├── Skeleton.tsx
│       ├── Toast.tsx
│       └── ConfirmDialog.tsx
├── hooks/
│   ├── useDDay.ts                  # GET/PUT/DELETE d-day
│   ├── useChecklists.ts            # 목록/생성/수정/삭제/토글 (optimistic)
│   └── useChecklistSummary.ts
├── lib/
│   ├── api.ts                      # fetch 래퍼, 에러 처리
│   ├── constants.ts                # 카테고리 라벨/색상 매핑
│   └── date.ts                     # 날짜 포맷 유틸
└── types/
    └── index.ts                    # API 응답 타입
```

### 5.6 컴포넌트 명세

| 컴포넌트 | Props (주요) | 책임 |
|---|---|---|
| `DDayBanner` | `data: DDayResponse`, `onEdit()` | D-Day 라벨/날짜 표시, 상태별 스타일, 미설정 CTA |
| `WeddingDateModal` | `open`, `initialDate?`, `onSubmit(date)`, `onClose()` | 날짜 입력 및 검증, 저장, 과거 날짜 안내 |
| `ProgressSummary` | `summary: ChecklistSummaryResponse` | 전체 진행률 바와 수치 |
| `CategoryTabs` | `selected`, `onChange(category \| 'ALL')` | 카테고리 필터 탭 |
| `FilterBar` | `status`, `onStatusChange`, `onAdd()` | 완료 여부 필터 및 추가 트리거 |
| `ChecklistBoard` | - | 데이터 조회, 카테고리 그룹핑, 섹션 렌더링 |
| `ChecklistSection` | `category`, `items`, `onAddInCategory()` | 섹션 헤더(진행 수), 항목 목록 |
| `ChecklistItem` | `item`, `onToggle(id, next)`, `onEdit(item)`, `onDelete(id)` | 체크박스 토글, 취소선, 기한 초과 뱃지 |
| `ChecklistFormModal` | `open`, `mode: 'create' \| 'edit'`, `defaultValues`, `onSubmit` | 제목/카테고리/마감일/메모 입력 및 검증 |
| `ConfirmDialog` | `open`, `message`, `onConfirm`, `onCancel` | 삭제 확인 |

### 5.7 상호작용 및 UX 상세

| 시나리오 | 동작 |
|---|---|
| 앱 진입 | `d-day`, `checklists`, `summary`를 병렬 호출하고 로딩 중 스켈레톤을 표시 |
| 날짜 설정/수정 | 모달에서 날짜 선택 후 저장하면 `PUT` 호출, 성공 시 모달을 닫고 배너를 즉시 갱신 |
| 항목 체크 | 낙관적 업데이트로 즉시 취소선 처리 후 `PATCH` 호출, 실패 시 롤백하고 토스트 표시, 성공 시 `summary` 재조회 |
| 항목 추가 | 폼 모달에서 제목(필수)/카테고리(필수)/마감일/메모 입력 후 `POST`. 섹션 내 `+` 버튼에서 열면 카테고리를 자동 선택 |
| 항목 삭제 | 확인 다이얼로그 후 `DELETE`, 성공 시 목록에서 제거 |
| 카테고리 탭 선택 | 해당 카테고리 섹션만 표시 (클라이언트 필터, 항목이 적으므로 충분) |
| 모바일 | 섹션 아코디언 접기/펼치기, 우하단 FAB로 추가 |

### 5.8 TailwindCSS 스타일 가이드 (제안)

| 요소 | 클래스 예시 |
|---|---|
| 페이지 배경 | `bg-rose-50/40 min-h-screen` |
| 컨테이너 | `mx-auto max-w-3xl px-4 py-6` |
| D-Day 카드 | `rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-white p-8 text-center shadow-lg` |
| D-Day 숫자 | `text-5xl md:text-6xl font-extrabold tracking-tight` |
| 섹션 카드 | `rounded-2xl bg-white shadow-sm border border-gray-100 p-4` |
| 완료 항목 | `line-through text-gray-400` |
| 기한 초과 뱃지 | `text-xs font-medium text-red-600 bg-red-50 rounded-full px-2 py-0.5` |
| 주 버튼 | `rounded-xl bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 transition` |

---

## 6. 인수 조건 (Acceptance Criteria)

### D-Day
- [ ] 결혼식 날짜 저장 후 새로고침해도 값이 유지된다.
- [ ] 메인 화면 최상단에 `D-n`, `D-Day`, `D+n` 중 올바른 형식이 표시된다.
- [ ] 날짜 미설정 시 설정 유도 CTA가 표시되고 클릭하면 모달이 열린다.
- [ ] 날짜를 수정하면 D-Day가 즉시 갱신된다.
- [ ] 잘못된 날짜 형식은 API에서 `422`로 거부된다.
- [ ] D-Day 계산은 KST 기준이며, 자정 전후 경계값 테스트를 통과한다.

### 체크리스트
- [ ] 카테고리별로 그룹핑된 목록이 표시된다.
- [ ] 제목/카테고리를 입력해 항목을 추가하면 목록에 즉시 반영된다.
- [ ] 제목이 비어 있거나 100자를 초과하면 추가되지 않고 오류 메