# 시스템 아키텍처 및 구현 체크리스트
**대상**: OpenHands 개발 에이전트 | **기반 문서**: PRD v1.0 (이슈 #1) | **스택**: FastAPI + SQLAlchemy(SQLite) / Next.js(App Router) + TailwindCSS

> **참고**: 전달받은 PRD는 6장 인수 조건(체크리스트 부분) 중간에서 끊겨 있습니다. 이 문서는 잘린 부분을 FR-2.x와 BR-x에서 유추해 보완했고, 해당 항목에는 `(유추)`를 표기했습니다.
> 표기 규칙은 PRD와 같습니다. **[필수]**는 이슈 명시 요구사항, **[제안]**은 보완 사항입니다.

---

## 0. 에이전트 작업 원칙

1. **순서 준수**: Phase 0 → 6 순으로 진행하고, 각 Phase 끝의 *Done 기준*을 통과한 뒤 다음으로 넘어갑니다.
2. **백엔드 우선**: API를 pytest로 검증한 뒤 프론트엔드를 구현합니다. 프론트는 `/docs`(OpenAPI) 스펙에 맞춥니다.
3. **우선순위**: [필수] → P0 → P1([제안]) → P2 순으로 구현합니다. 일정이 빠듯하면 P2(US-1.5, DELETE wedding-date 등)는 마지막에 처리합니다.
4. **작은 커밋**: Task 단위로 커밋합니다. 예: `feat(backend): add D-Day service`.
5. **스펙 변경 금지**: 엔드포인트 경로, 필드명, 오류 코드는 PRD 그대로 사용합니다. 모호한 부분은 4장의 결정 사항을 따릅니다.

---

## 1. 전체 시스템 구조

### 1.1 컴포넌트 구조도

```
┌────────────────────────── Browser (모바일/데스크톱) ──────────────────────────┐
│                                                                              │
│  Next.js (App Router, TS, Tailwind)  :3000                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ app/page.tsx  (Client Component 트리)                                    │  │
│  │  ├─ DDayBanner ─────────── useDDay ───────────┐                         │  │
│  │  ├─ ProgressSummary ────── useChecklistSummary ┤   TanStack Query       │  │
│  │  ├─ CategoryTabs / FilterBar  (로컬 UI state)   ├─  (cache, optimistic,  │  │
│  │  └─ ChecklistBoard ─────── useChecklists ──────┘    invalidate)          │  │
│  │        └ Section → Item / FormModal / ConfirmDialog / Toast             │  │
│  └───────────────────────────────┬────────────────────────────────────────┘  │
│                                  │ lib/api.ts (fetch wrapper, ApiError)      │
└──────────────────────────────────┼───────────────────────────────────────────┘
                                   │ HTTP/JSON  NEXT_PUBLIC_API_BASE_URL
                                   │ CORS: http://localhost:3000 only
┌──────────────────────────────────▼───────────────────────────────────────────┐
│  FastAPI  :8000   (/api/v1, /docs)                                           │
│  ┌──────────────┐   ┌────────────────────┐   ┌─────────────────────────┐     │
│  │ routers/     │──▶│ services/          │──▶│ models.py (SQLAlchemy)  │     │
│  │ settings     │   │ dday_service (KST) │   │ WeddingSetting (id=1)   │     │
│  │ checklists   │   │ checklist_service  │   │ ChecklistItem           │     │
│  │ meta         │   │  (BR-1,2,5, 집계)   │   └───────────┬─────────────┘     │
│  └──────┬───────┘   └────────────────────┘               │                   │
│         │ Pydantic schemas (검증/직렬화)                    │ get_db Session    │
│  core/exceptions (code/message 핸들러) · core/config (.env)│                   │
│  lifespan: create_all() → 최초 1회 seed                    │                   │
└────────────────────────────────────────────────────────────┼─────────────────┘
                                                             ▼
                                              SQLite (wedding.db) ※ PostgreSQL 교체 가능
```

### 1.2 계층 책임

| 계층 | 책임 | 하지 말아야 할 것 |
|---|---|---|
| Router | HTTP 매핑, 상태코드, 의존성 주입 | 비즈니스 로직, 직접 쿼리 |
| Service | D-Day 계산, 완료 상태 전이(BR-1), overdue 계산(BR-2), 정렬(BR-5), 집계, 시드 | HTTP 객체 의존 |
| Model | 테이블 매핑 | 로직 |
| Schema | 입력 검증, 응답 직렬화 | DB 접근 |
| FE Hook | 서버 상태, 캐시 키, optimistic 처리 | UI 렌더링 |
| FE Component | 렌더링, 로컬 UI 상태 | 직접 fetch 호출 |

### 1.3 주요 데이터 흐름

**① 앱 진입 (병렬 로딩)**
```
page mount ─┬─ GET /settings/d-day     → DDayBanner (skeleton → 상태별 UI)
            ├─ GET /checklists         → ChecklistBoard (카테고리별 그룹핑)
            └─ GET /checklists/summary → ProgressSummary / 섹션 헤더 진행수
```

**② D-Day 설정**
```
WeddingDateModal 제출 → (과거 날짜면 확인 안내) → PUT /settings/wedding-date
 → Service: id=1 upsert → today_kst 기준 d_day 계산 → DDayResponse
 → 성공: setQueryData(['d-day']) + 모달 닫기
```

**③ 체크 토글 (Optimistic, NFR-1)**
```
click → onMutate: cancelQueries, 캐시 스냅샷 저장, is_completed/completed_at 즉시 반영
      → PATCH /checklists/{id} {is_completed}
 ├ 성공 : (서버 응답으로 해당 item 교체) → invalidate ['checklist-summary']
 └ 실패 : onError 스냅샷 롤백 + Toast
```

**④ 항목 추가/수정/삭제**
```
FormModal submit → (Zod 검증) → POST/PATCH/DELETE
 → 성공: invalidate ['checklists'], ['checklist-summary'] / Toast
 → 422: 필드 오류 표시, 4xx/5xx(code/message): Toast
```

**⑤ 최초 실행 시드**
```
lifespan startup → create_all → (최초 실행 & 항목 0개) → seed 삽입
수동: POST /checklists/seed → 항목 있으면 409 SEED_ALREADY_APPLIED
EmptyState의 [기본 체크리스트 불러오기] 버튼이 이 API를 호출
```

---

## 2. 프로젝트 디렉터리 레이아웃

```
wedding-planner/                      # 리포지토리 루트
├── README.md                         # 실행 방법(backend/frontend), 환경변수 설명
├── .gitignore
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI(), CORS, 라우터(prefix=/api/v1), 예외 핸들러, lifespan
│   │   ├── core/
│   │   │   ├── config.py             # pydantic-settings: DATABASE_URL, CORS_ORIGINS, TIMEZONE
│   │   │   └── exceptions.py         # AppException(status, code, message) + handlers
│   │   ├── database.py               # engine(check_same_thread=False), SessionLocal, Base, get_db
│   │   ├── models.py
│   │   ├── schemas/{common,wedding,checklist,error}.py
│   │   ├── routers/{settings,checklists,meta}.py
│   │   ├── services/{dday_service,checklist_service}.py
│   │   └── seed/default_checklist.py
│   ├── tests/
│   │   ├── conftest.py               # 임시 SQLite(메모리/tmp) + dependency_overrides + TestClient
│   │   ├── test_dday.py
│   │   └── test_checklists.py
│   ├── requirements.txt              # fastapi, uvicorn[standard], sqlalchemy, pydantic, pydantic-settings, tzdata, pytest, httpx
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── app/{layout.tsx, page.tsx, globals.css}
    │   ├── components/
    │   │   ├── layout/Header.tsx
    │   │   ├── dday/{DDayBanner,WeddingDateModal}.tsx
    │   │   ├── checklist/{ProgressSummary,CategoryTabs,FilterBar,ChecklistBoard,
    │   │   │              ChecklistSection,ChecklistItem,ChecklistFormModal,EmptyState}.tsx
    │   │   └── ui/{Button,Modal,Checkbox,ProgressBar,Skeleton,Toast,ConfirmDialog}.tsx
    │   ├── hooks/{useDDay,useChecklists,useChecklistSummary}.ts
    │   ├── lib/{api.ts,constants.ts,date.ts,queryKeys.ts}
    │   └── types/index.ts
    ├── .env.local.example            # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
    ├── package.json / tailwind.config.ts / tsconfig.json / next.config.js
    └── (선택) Zod 스키마: src/lib/schemas.ts
```

> `frontend/src/lib/queryKeys.ts`는 PRD 구조에 추가한 파일입니다. 쿼리 키 상수를 한곳에서 관리하기 위한 것입니다.

---

## 3. 핵심 설계 결정 (PRD 모호성 해소)

| # | 이슈 | 결정 |
|---|---|---|
| D1 | **PATCH에서 `null` 구분** (`due_date`/`memo`를 비우고 싶은 경우) | `payload.model_dump(exclude_unset=True)`로 **전달된 필드만** 반영합니다. `due_date: null`은 "마감일 제거"로 처리합니다. `title`/`category`/`is_completed`에 `null`이 오면 422로 거부합니다(validator). |
| D2 | **title 공백 처리 (BR-3)** | `field_validator("title", mode="before")`에서 `strip()`을 적용한 뒤 min_length=1을 검사합니다. `"   "`는 422입니다. Create와 Update에 모두 적용합니다. |
| D3 | **KST "오늘"** | `datetime.now(ZoneInfo("Asia/Seoul")).date()`를 사용합니다. Windows 호환을 위해 `tzdata`를 requirements에 포함합니다. 서비스 함수는 `today: date \| None = None` 인자를 받아 **테스트에서 날짜를 주입**할 수 있게 합니다. |
| D4 | **datetime 저장 기준** | `completed_at`/`created_at`/`updated_at`은 **KST naive datetime**으로 통일합니다(`completed_at`은 서비스에서 KST now로 세팅). 한 곳(`core/config` 또는 `services/clock.py`)에서 `now_kst()`를 제공합니다. |
| D5 | **싱글톤 설정** | `id=1` 행을 `get_or_create`로 다룹니다. `GET`은 행이 없어도 `NOT_SET`을 반환하고, `PUT`은 upsert합니다. `DELETE`는 `wedding_date=NULL`로 갱신하며 멱등으로 204를 반환합니다. |
| D6 | **라우트 순서** | `routers/checklists.py`에서 `/summary`와 `/seed`를 `/{id}`보다 **먼저** 선언하고, `id: int`로 타입 지정합니다. |
| D7 | **summary의 by_category** | Enum 7개를 **모두** 포함합니다(항목이 0개면 `total=0, progress_rate=0.0`). 0으로 나누기를 방지하고, 소수점 첫째 자리로 반올림합니다. |
| D8 | **카테고리 라벨 단일 출처** | 백엔드는 `CATEGORY_LABELS` dict 하나를 두고 `/categories`와 summary가 공유합니다. 프론트 `constants.ts`는 색상 매핑을 포함하며, 라벨은 `/categories` 응답과 일치시킵니다. |
| D9 | **시드 시점** | lifespan에서 `checklist_items`가 비어 있고 `wedding_settings` 행도 없는 **최초 실행**에만 삽입합니다. 사용자가 전부 삭제한 뒤 재시작해도 재시드되지 않게 하기 위해서입니다. 시드 항목은 ETC를 제외한 6개 카테고리 20개이며, `inserted: 20`이 되도록 PRD 3.7 표를 그대로 사용합니다. |
| D10 | **오류 응답 형식** | `AppException`은 `{code, message}`로 응답합니다. 422는 FastAPI 기본을 유지합니다. 500은 `INTERNAL_SERVER_ERROR`로 변환하는 핸들러를 둡니다. |
| D11 | **POST 201** | `Location: /api/v1/checklists/{id}` 헤더를 `Response` 객체로 설정합니다. |
| D12 | **필터 위치** | 서버는 `category`/`is_completed`/`q`를 지원하지만, 프론트는 **전체 목록을 1회 조회 후 클라이언트에서 필터링**합니다(PRD 5.7). 그래야 낙관적 업데이트와 섹션 진행수 계산이 단순해집니다. |
| D13 | **Optimistic 캐시 대상** | `['checklists']`는 **필터 없는 단일 키**로 둡니다. 토글 시 이 캐시의 item만 수정하고, 성공 후 `['checklist-summary']`를 invalidate합니다. |
| D14 | **is_overdue** | DB 컬럼이 아니라 응답 시점에 계산합니다(BR-2). 서비스에서 ORM 객체를 `ChecklistItemResponse`로 변환할 때 주입합니다. |
| D15 | **정렬 (BR-5)** | SQL `ORDER BY is_completed ASC, (due_date IS NULL) ASC, due_date ASC, created_at ASC`로 구현합니다(`id ASC`를 tie-breaker로 추가). |

### 핵심 코드 스니펫 (참고용)

```python
# services/dday_service.py
def compute_dday(wedding_date: date | None, today: date | None = None) -> dict:
    if wedding_date is None:
        return {"wedding_date": None, "d_day": None, "label": None, "status": "NOT_SET"}
    today = today or today_kst()
    diff = (wedding_date - today).days
    if diff > 0:  return {..., "d_day": diff, "label": f"D-{diff}", "status": "UPCOMING"}
    if diff == 0: return {..., "d_day": 0,    "label": "D-Day",     "status": "TODAY"}
    return {..., "d_day": diff, "label": f"D+{-diff}", "status": "PASSED"}
```

```python
# services/checklist_service.py (update 핵심)
data = payload.model_dump(exclude_unset=True)
if "is_completed" in data and data["is_completed"] != item.is_completed:
    item.completed_at = now_kst() if data["is_completed"] else None   # BR-1
for k, v in data.items():
    setattr(item, k, v)
```

```tsx
// hooks/useChecklists.ts (토글 mutation 골격, TanStack Query v5)
onMutate: async ({ id, next }) => {
  await qc.cancelQueries({ queryKey: KEYS.checklists });
  const prev = qc.getQueryData<ChecklistItem[]>(KEYS.checklists);
  qc.setQueryData<ChecklistItem[]>(KEYS.checklists, (old) =>
    old?.map((i) => i.id === id ? { ...i, is_completed: next,
      completed_at: next ? new Date().toISOString() : null } : i));
  return { prev };
},
onError: (_e, _v, ctx) => { qc.setQueryData(KEYS.checklists, ctx?.prev); toast.error(...) },
onSettled: () => qc.invalidateQueries({ queryKey: KEYS.summary }),
```

---

## 4. Task Breakdown 체크리스트

### Phase 0. 프로젝트 초기화
- [ ] **T0.1** 리포지토리 루트에 `backend/`, `frontend/`, `README.md`, `.gitignore`(venv, `__pycache__`, `*.db`, `node_modules`, `.next`, `.env*`)를 생성한다.
- [ ] **T0.2** `backend/requirements.txt`와 `.env.example`(`DATABASE_URL=sqlite:///./wedding.db`, `CORS_ORIGINS=http://localhost:3000`, `TIMEZONE=Asia/Seoul`)을 작성한다.
- [ ] **T0.3** `frontend`를 `create-next-app`(TypeScript, Tailwind, App Router, `src/` 디렉터리)으로 생성하고 `@tanstack/react-query`, `lucide-react`를 설치한다. 폼 라이브러리(`react-hook-form`, `zod`)는 선택 사항이다.
- [ ] **T0.4** `.env.local.example`을 작성한다(`NEXT_PUBLIC_API_BASE_URL`).

**Done**: `uvicorn app.main:app`과 `npm run dev`가 각각 빈 상태로 기동된다.

---

### Phase 1. 백엔드 기반 (DB / 설정 / 공통)
- [ ] **T1.1** `core/config.py`: pydantic-settings로 환경변수를 로드한다(CORS origins는 콤마 구분 → list).
- [ ] **T1.2** `database.py`: engine(SQLite 시 `check_same_thread=False`), `SessionLocal`, `Base`, `get_db`를 작성한다.
- [ ] **T1.3** `models.py`: PRD 3.5대로 `WeddingSetting`, `ChecklistItem`을 작성한다. 인덱스는 `category`, `is_completed`에 둔다.
- [ ] **T1.4** `schemas/{common,wedding,checklist,error}.py`: PRD 3.4대로 작성하되 D2(title strip)와 D1(null 거부 validator)을 반영한다.
- [ ] **T1.5** `CATEGORY_LABELS`(D8)와 `now_kst()`/`today_kst()`(D3, D4)를 구현한다.
- [ ] **T1.6** `core/exceptions.py`: `AppException`과 핸들러(AppException, 500 fallback)를 작성한다.
- [ ] **T1.7** `main.py`: CORS(허용 오리진 제한, NFR-7), `/api/v1` 라우터 등록, 예외 핸들러 등록, lifespan(`create_all`)을 구성한다.

**Done**: 서버가 기동되고 `/docs`가 열린다. DB 파일에 두 테이블이 생성된다.

---

### Phase 2. 백엔드 – D-Day (Epic 1)
- [ ] **T2.1** `services/dday_service.py`: `compute_dday`, `get_setting`, `upsert_wedding_date`, `clear_wedding_date`를 구현한다(D3, D5).
- [ ] **T2.2** `routers/settings.py`를 구현한다.
  - [ ] `GET /settings/d-day` (미설정 시 `NOT_SET`)
  - [ ] `PUT /settings/wedding-date` (`updated_at` 포함)
  - [ ] `DELETE /settings/wedding-date` (204, 멱등) [제안]
- [ ] **T2.3** `tests/test_dday.py`를 작성한다.
  - [ ] 미설정 → `NOT_SET`
  - [ ] 미래 날짜 → `D-n` / `UPCOMING`
  - [ ] 당일 → `D-Day` / `TODAY`
  - [ ] 과거 → `D+n` / `PASSED`
  - [ ] **자정 경계**: `today`를 주입해 전날/당일/다음날 검증(`2026-10-16/17/18`)
  - [ ] PRD 예시: `today=2026-06-11`, `wedding=2026-10-17` → `d_day=128`
  - [ ] 잘못된 형식(`"2026-13-40"`, `"abc"`) → 422
  - [ ] 수정(PUT 2회) 후 값 반영, DELETE 멱등성

**Done**: `pytest tests/test_dday.py` 전부 통과.

---

### Phase 3. 백엔드 – 체크리스트 (Epic 2)
- [ ] **T3.1** `services/checklist_service.py`를 구현한다.
  - [ ] `list_items(category, is_completed, q)`: BR-5 정렬(D15), `q`는 `ilike('%q%')`
  - [ ] `create_item`, `get_item`(없으면 `CHECKLIST_NOT_FOUND`), `update_item`(D1, BR-1), `delete_item`
  - [ ] `to_response`: `is_overdue`를 BR-2대로 주입(D14)
  - [ ] `get_summary`: 7개 카테고리 전부 포함, 0 나눗셈 방지(D7)
  - [ ] `seed_defaults`: 항목이 있으면 `SEED_ALREADY_APPLIED`(409)
- [ ] **T3.2** `seed/default_checklist.py`: PRD 3.7의 20개 항목을 정의한다. 필수 항목은 제목/카테고리이고 `due_date`는 `null`이다.
- [ ] **T3.3** `routers/checklists.py`를 구현한다(D6: 라우트 선언 순서 주의).
  - [ ] `GET /checklists/summary`, `POST /checklists/seed`를 먼저 선언
  - [ ] `GET /checklists` (쿼리 `category`, `is_completed`, `q`)
  - [ ] `POST /checklists` (201 + Location 헤더, D11)
  - [ ] `GET /checklists/{id}` (404 포맷 확인)
  - [ ] `PATCH /checklists/{id}`
  - [ ] `DELETE /checklists/{id}` (204/404)
- [ ] **T3.4** `routers/meta.py`: `GET /categories`, `GET /health`를 구현한다.
- [ ] **T3.5** lifespan에서 최초 실행 시드를 연결한다(D9).
- [ ] **T3.6** `tests/test_checklists.py`를 작성한다.
  - [ ] 생성: 정상 / 제목 누락 / 101자 / 공백만 / 잘못된 category / memo 501자 → 422
  - [ ] 제목 앞뒤 공백이 저장 시 제거됨
  - [ ] 완료 토글: `completed_at` 설정 → 되돌리면 `null` (BR-1)
  - [ ] 이미 완료 상태에서 `is_completed: true` 재전송 시 `completed_at`이 바뀌지 않음
  - [ ] `due_date: null`로 마감일 제거 가능, 필드 미전달 시 유지 (D1)
  - [ ] `is_overdue`: 과거 마감+미완료=true, 완료=false, 마감 없음=false (BR-2)
  - [ ] 정렬 BR-5 (미완료 우선, due_date NULL 마지막, created_at)
  - [ ] 필터: category, is_completed, q 및 조합
  - [ ] 404: 존재하지 않는 id의 GET/PATCH/DELETE 응답이 `{"code":"CHECKLIST_NOT_FOUND",...}`
  - [ ] summary 수치 / 빈 DB / 0 나눗셈 안전
  - [ ] seed: 최초 201(`inserted: 20`), 재호출 409 `SEED_ALREADY_APPLIED`
  - [ ] `/summary`가 `/{id}`로 잘못 매칭되지 않음 (200 확인)

**Done**: `pytest` 전체 통과. Swagger UI에서 모든 엔드포인트를 수동 호출해 PRD 4.3 응답 예시와 필드가 일치한다.

---

### Phase 4. 프론트엔드 기반
- [ ] **T4.1** `types/index.ts`: `Category`, `DDayResponse`, `ChecklistItem`, `ChecklistSummary`, `ApiError` 타입을 정의한다(백엔드 스키마와 1:1).
- [ ] **T4.2** `lib/api.ts`를 작성한다.
  - [ ] `NEXT_PUBLIC_API_BASE_URL` 기반 fetch 래퍼
  - [ ] 204 처리(본문 없음)
  - [ ] 에러 파싱: `{code,message}` 또는 422 `detail[]` → `ApiError` 통일
  - [ ] 네트워크 오류 시 사용자 친화 메시지
- [ ] **T4.3** `lib/constants.ts`(카테고리 라벨/색상/순서), `lib/date.ts`(`2026년 10월 17일 (토)`, `2026.10.17 (토)` 포맷, KST 무관한 순수 포맷), `lib/queryKeys.ts`를 작성한다.
- [ ] **T4.4** `app/layout.tsx`: QueryClientProvider(Client Provider 분리), 한국어 폰트, `lang="ko"`, 전역 Toast Provider를 구성한다.
- [ ] **T4.5** `components/ui/*`: Button, Modal(포커스 트랩·ESC 닫기·`role="dialog"`), Checkbox(label 연결), ProgressBar(`role="progressbar"` + aria 속성), Skeleton, Toast, ConfirmDialog를 구현한다.
- [ ] **T4.6** Tailwind 스타일 가이드(PRD 5.8)를 반영하고 `globals.css`를 정리한다.

**Done**: 빈 페이지에서 UI 프리미티브가 렌더링된다(임시 데모 가능). 타입 에러가 없다.

---

### Phase 5. 프론트엔드 – 기능 구현
**D-Day**
- [ ] **T5.1** `hooks/useDDay.ts`: GET, PUT(성공 시 `setQueryData`), DELETE를 구현한다.
- [ ] **T5.2** `DDayBanner`: 로딩 스켈레톤 / 미설정 CTA / UPCOMING / TODAY(`D-Day 🎉` 강조) / PASSED(`D+n`)를 구현한다. `[날짜 수정]`, `[날짜 설정]` 버튼을 포함한다.
- [ ] **T5.3** `WeddingDateModal`: `input type="date"`, 필수 검증, **과거 날짜 선택 시 확인 안내**(FR-1.6), 저장 중 버튼 비활성화, 성공 시 닫기를 구현한다. (선택) 초기화(삭제) 버튼 [P2].

**체크리스트 조회/진행률**
- [ ] **T5.4** `hooks/useChecklists.ts`: 목록 조회와 create/update/delete/toggle mutation(D13)을 구현한다. toggle은 optimistic 방식으로 하고 실패 시 롤백 + 토스트를 띄운다.
- [ ] **T5.5** `hooks/useChecklistSummary.ts`를 구현한다. 모든 mutation 성공 시 invalidate한다.
- [ ] **T5.6** `ProgressSummary`: 전체 진행률 바와 `30% (6/20)` 표기를 구현한다.
- [ ] **T5.7** `CategoryTabs`: `ALL` + 7개 카테고리, 모바일은 가로 스크롤, `aria-selected`를 적용한다.
- [ ] **T5.8** `FilterBar`: 상태 라디오(전체/미완료/완료)와 `[+ 항목 추가]`를 구현한다.
- [ ] **T5.9** `ChecklistBoard`: 카테고리별 그룹핑, 탭/상태 클라이언트 필터(D12), 서버가 준 정렬 순서 유지, 빈 상태/필터 결과 없음/오류(재시도) 분기를 구현한다.
- [ ] **T5.10** `ChecklistSection`: 헤더(`예식장 2/4`), 모바일 아코디언, `[+ 이 카테고리에 추가]`(카테고리 자동 선택)를 구현한다.
- [ ] **T5.11** `ChecklistItem`: 체크박스+label, 완료 시 `line-through text-gray-400`, 마감일 `📅 7/1`, **기한 초과 뱃지**(`is_overdue`), 수정/삭제 버튼(접근성 `aria-label`)을 구현한다.
- [ ] **T5.12** `ChecklistFormModal`: create/edit 모드, 제목(1~100, trim)/카테고리/마감일/메모(≤500) 검증, 서버 422 메시지 매핑, 제출 중 중복 클릭 방지를 구현한다.
- [ ] **T5.13** `ConfirmDialog`를 삭제 흐름에 연결한다.
- [ ] **T5.14** `EmptyState`: `[기본 체크리스트 불러오기]`(`POST /seed`, 409는 안내 토스트 처리)와 `[직접 추가]`를 구현한다.
- [ ] **T5.15** `app/page.tsx` 조립: Header → DDayBanner → ProgressSummary → CategoryTabs → FilterBar → ChecklistBoard. 모바일 FAB(우하단 `＋`)을 추가한다.
- [ ] **T5.16** 전역 오류 처리: 모든 mutation/query 오류가 토스트로 노출되도록 연결한다(NFR-5).

**Done**: 로컬에서 E2E 수동 시나리오(6장)가 통과한다. `npm run build`, `npm run lint`, `tsc --noEmit`가 에러 없이 통과한다.

---

### Phase 6. 품질 보증 및 마무리
- [ ] **T6.1** 반응형 점검: 360 / 640 / 1024 / 1440px에서 가로 스크롤과 레이아웃 깨짐이 없는지 확인한다(NFR-2).
- [ ] **T6.2** 접근성 점검(NFR-3): 키보드만으로 날짜 설정 → 항목 추가 → 체크 → 삭제가 가능하고, 모달 포커스 관리, 체크박스 label 연결, 텍스트 명도 대비 AA(특히 `text-gray-400` 완료 텍스트와 rose 계열 버튼 흰 글씨)를 확인한다.
- [ ] **T6.3** 성능 점검: 초기 로딩에서 3개 API가 병렬 호출되는지(워터폴 없음), 불필요한 리렌더링이나 거대 번들이 없는지 확인한다(LCP 목표 2.5초 이내).
- [ ] **T6.4** 보안 점검(NFR-7): CORS가 `localhost:3000`으로 제한되는지, 입력 길이 제한, ORM 외 raw SQL을 쓰지 않았는지 확인한다.
- [ ] **T6.5** `README.md`: 설치/실행 방법(backend: `uvicorn app.main:app --reload`, frontend: `npm run dev`), 환경변수, 테스트 실행 방법, 가정(A1~A4), API 문서 위치(`/docs`)를 작성한다.
- [ ] **T6.6** 최종 회귀: `pytest -q`, `npm run lint`, `npm run build`를 모두 통과시킨다. 빈 DB에서 처음부터 기동해 시드가 20건 삽입되는지 확인한다.

---

## 5. 인수 조건 대응표 (최종 검증용)

PRD 6장 기준이며, 잘린 체크리스트 부분은 FR-2.x에서 유추했습니다(유추).

| 인수 조건 | 검증 위치 |
|---|---|
| 날짜 저장 후 새로고침해도 유지 | 수동 E2E, `test_dday` (PUT → GET) |
| 상단에 `D-n`/`D-Day`/`D+n` 올바르게 표시 | `test_dday`, `DDayBanner` 수동 확인 |
| 미설정 시 CTA → 클릭 시 모달 | 수동 E2E (T5.2/T5.3) |
| 날짜 수정 시 D-Day 즉시 갱신 | 수동 E2E, `setQueryData` |
| 잘못된 날짜 형식 → API 422 | `test_dday` |
| KST 기준·자정 경계 테스트 통과 | `test_dday` (today 주입) |
| 카테고리별 그룹핑 목록 표시 | `ChecklistBoard` 수동 확인 |
| 제목/카테고리로 추가 시 즉시 반영 | 수동 E2E, `test_checklists` |
| 제목 비어 있거나 100자 초과 시 추가 불가 + 오류 메시지 | `test_checklists` (422), FormModal 검증 |
| (유추) 체크 토글이 즉시 반영되고 실패 시 롤백 | 수동(네트워크 차단/서버 중지), optimistic 로직 |
| (유추) 완료 시 `completed_at` 기록, 해제 시 null | `test_checklists` (BR-1) |
| (유추) 수정/삭제(확인 다이얼로그 포함) 동작 | 수동 E2E, `test_checklists` |
| (유추) 필터(카테고리/완료 여부)와 진행률 표시 | `test_checklists`(summary), 수동 확인 |
| (유추) 기한 초과 항목 강조 | `test_checklists` (BR-2), `ChecklistItem` 확인 |
| (유추) 최초 실행 시 시드 20건, 중복 시드 409 | `test_checklists` |
| (유추) `/docs`에서 API 스펙 확인 | 수동 (NFR-6) |

---

## 6. 수동 E2E 시나리오 (Phase 5 Done 기준)

1. 빈 DB로 기동하면 시드 20건이 표시되고 D-Day 영역에는 CTA가 보인다.
2. `[날짜 설정]`에서 미래 날짜를 저장하면 `D-n`이 즉시 표시된다. 새로고침해도 유지된다.
3. 과거 날짜를 입력하면 확인 안내가 뜨고, 저장하면 `D+n`이 표시된다. 오늘 날짜를 저장하면 `D-Day 🎉`가 표시된다.
4. 체크박스를 클릭하면 취소선이 즉시 적용되고 진행률이 갱신된다. 백엔드를 중단한 뒤 클릭하면 롤백되고 토스트가 뜬다.
5. 제목 없이 추가를 시도하면 오류가 표시된다. 정상 입력하면 해당 섹션에 추가된다.
6. 섹션의 `+` 버튼으로 모달을 열면 카테고리가 자동 선택된다.
7. 마감일을 과거로 지정한 미미완료 항목에 `기한 초과` 뱃지가 표시된다.
8. 삭제 시 확인 다이얼로그가 뜨고, 확인하면 목록과 진행률에서 제거된다.
9. 탭과 상태 필터를 조합하면 결과가 없을 때 "조건에 맞는 항목이 없어요"가 표시된다.
10. 모든 항목을 삭제하면 EmptyState가 표시되고, `[기본 체크리스트 불러오기]`로 복구된다.

---

## 7. 범위 외 (구현하지 말 것)

인증/멀티 유저, 알림, 예산·업체·파일 첨부, 다국어, 드래그 앤 드롭 정렬, 사용자 정의 카테고리는 MVP에서 제외합니다. 확장을 대비해 서비스 계층과 모델을 분리해 두는 것까지만 하고, 이를 위한 추가 코드(예: `user_id` 컬럼)는 넣지 않습니다.