from datetime import date, timedelta
from app.services.checklist_service import to_response
from app.models import ChecklistItem


def test_create_checklist_valid(client):
    res = client.post(
        "/api/v1/checklists",
        json={"title": "  웨딩홀 투어 예약  ", "category": "VENUE", "due_date": "2026-08-01", "memo": "강남권"},
    )
    assert res.status_code == 201
    assert "Location" in res.headers
    data = res.json()
    assert data["title"] == "웨딩홀 투어 예약"  # trimmed
    assert data["category"] == "VENUE"
    assert data["is_completed"] is False
    assert data["completed_at"] is None
    assert data["memo"] == "강남권"


def test_create_checklist_validation_errors(client):
    # 제목 누락
    assert client.post("/api/v1/checklists", json={"category": "VENUE"}).status_code == 422
    # 공백만
    assert client.post("/api/v1/checklists", json={"title": "   ", "category": "VENUE"}).status_code == 422
    # 101자
    assert client.post("/api/v1/checklists", json={"title": "a" * 101, "category": "VENUE"}).status_code == 422
    # 잘못된 category
    assert client.post("/api/v1/checklists", json={"title": "test", "category": "UNKNOWN"}).status_code == 422
    # memo 501자
    assert client.post("/api/v1/checklists", json={"title": "test", "category": "VENUE", "memo": "a" * 501}).status_code == 422


def test_toggle_completion_and_idempotence(client):
    create_res = client.post(
        "/api/v1/checklists",
        json={"title": "드레스 투어", "category": "SDM"},
    )
    item_id = create_res.json()["id"]

    # 완료 처리
    patch1 = client.patch(f"/api/v1/checklists/{item_id}", json={"is_completed": True})
    assert patch1.status_code == 200
    data1 = patch1.json()
    assert data1["is_completed"] is True
    completed_at1 = data1["completed_at"]
    assert completed_at1 is not None

    # 이미 완료 상태에서 재전송 시 completed_at 유지
    patch2 = client.patch(f"/api/v1/checklists/{item_id}", json={"is_completed": True})
    assert patch2.status_code == 200
    assert patch2.json()["completed_at"] == completed_at1

    # 완료 해제
    patch3 = client.patch(f"/api/v1/checklists/{item_id}", json={"is_completed": False})
    assert patch3.status_code == 200
    assert patch3.json()["is_completed"] is False
    assert patch3.json()["completed_at"] is None


def test_patch_due_date_and_field_clearing(client):
    create_res = client.post(
        "/api/v1/checklists",
        json={"title": "항공권 예매", "category": "HONEYMOON", "due_date": "2026-07-01", "memo": "직항"},
    )
    item_id = create_res.json()["id"]

    # due_date null로 비우기
    patch_res = client.patch(f"/api/v1/checklists/{item_id}", json={"due_date": None})
    assert patch_res.status_code == 200
    assert patch_res.json()["due_date"] is None
    assert patch_res.json()["memo"] == "직항"  # 미전달 필드 유지

    # title, category, is_completed에 null 전달 시 422
    assert client.patch(f"/api/v1/checklists/{item_id}", json={"title": None}).status_code == 422
    assert client.patch(f"/api/v1/checklists/{item_id}", json={"category": None}).status_code == 422
    assert client.patch(f"/api/v1/checklists/{item_id}", json={"is_completed": None}).status_code == 422


def test_is_overdue_logic():
    from datetime import datetime
    ref_today = date(2026, 10, 17)
    past_date = date(2026, 10, 16)
    future_date = date(2026, 10, 18)
    now_dt = datetime.now()

    # 과거 마감 + 미완료 -> is_overdue=True
    item_past_incomplete = ChecklistItem(
        id=1, title="A", category="VENUE", due_date=past_date, is_completed=False, memo=None, completed_at=None, created_at=now_dt, updated_at=now_dt
    )
    res1 = to_response(item_past_incomplete, today=ref_today)
    assert res1.is_overdue is True

    # 과거 마감 + 완료 -> is_overdue=False
    item_past_complete = ChecklistItem(
        id=2, title="B", category="VENUE", due_date=past_date, is_completed=True, memo=None, completed_at=None, created_at=now_dt, updated_at=now_dt
    )
    res2 = to_response(item_past_complete, today=ref_today)
    assert res2.is_overdue is False

    # 미래 마감 + 미완료 -> is_overdue=False
    item_future = ChecklistItem(
        id=3, title="C", category="VENUE", due_date=future_date, is_completed=False, memo=None, completed_at=None, created_at=now_dt, updated_at=now_dt
    )
    res3 = to_response(item_future, today=ref_today)
    assert res3.is_overdue is False

    # 마감일 없음 -> is_overdue=False
    item_no_due = ChecklistItem(
        id=4, title="D", category="VENUE", due_date=None, is_completed=False, memo=None, completed_at=None, created_at=now_dt, updated_at=now_dt
    )
    res4 = to_response(item_no_due, today=ref_today)
    assert res4.is_overdue is False


def test_sorting_and_filtering(client):
    # 4개 항목 생성:
    # 1. 미완료, 마감일 있음(2026-08-01)
    # 2. 미완료, 마감일 없음
    # 3. 완료, 마감일 있음(2026-07-01)
    # 4. 미완료, 마감일 이름(2026-05-01)
    client.post("/api/v1/checklists", json={"title": "웨딩홀 A", "category": "VENUE", "due_date": "2026-08-01"})
    client.post("/api/v1/checklists", json={"title": "웨딩홀 B (마감없음)", "category": "VENUE"})
    c3 = client.post("/api/v1/checklists", json={"title": "스드메 C", "category": "SDM", "due_date": "2026-07-01"}).json()
    client.patch(f"/api/v1/checklists/{c3['id']}", json={"is_completed": True})
    client.post("/api/v1/checklists", json={"title": "웨딩홀 D (빠른마감)", "category": "VENUE", "due_date": "2026-05-01"})

    res = client.get("/api/v1/checklists")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 4

    # 정렬: 미완료 우선 -> due_date 오름차순(NULL 마지막) -> 완료된 것
    titles = [i["title"] for i in items]
    assert titles[0] == "웨딩홀 D (빠른마감)"
    assert titles[1] == "웨딩홀 A"
    assert titles[2] == "웨딩홀 B (마감없음)"
    assert titles[3] == "스드메 C"

    # 카테고리 필터
    res_venue = client.get("/api/v1/checklists?category=VENUE")
    assert len(res_venue.json()) == 3

    # 완료 여부 필터
    res_completed = client.get("/api/v1/checklists?is_completed=true")
    assert len(res_completed.json()) == 1
    assert res_completed.json()[0]["title"] == "스드메 C"

    # 검색 쿼리 q
    res_q = client.get("/api/v1/checklists?q=웨딩홀")
    assert len(res_q.json()) == 3


def test_404_error_format(client):
    get_res = client.get("/api/v1/checklists/999999")
    assert get_res.status_code == 404
    data = get_res.json()
    assert data["code"] == "CHECKLIST_NOT_FOUND"

    patch_res = client.patch("/api/v1/checklists/999999", json={"title": "수정"})
    assert patch_res.status_code == 404
    assert patch_res.json()["code"] == "CHECKLIST_NOT_FOUND"

    del_res = client.delete("/api/v1/checklists/999999")
    assert del_res.status_code == 404
    assert del_res.json()["code"] == "CHECKLIST_NOT_FOUND"


def test_summary_and_seed(client):
    # 빈 DB 상태 summary
    empty_summary = client.get("/api/v1/checklists/summary")
    assert empty_summary.status_code == 200
    s_data = empty_summary.json()
    assert s_data["total"] == 0
    assert s_data["completed"] == 0
    assert s_data["progress_rate"] == 0.0
    assert len(s_data["by_category"]) == 7  # 모든 카테고리 포함

    # 시드 삽입
    seed_res = client.post("/api/v1/checklists/seed")
    assert seed_res.status_code == 201
    assert seed_res.json()["inserted"] == 20

    # 중복 시드 삽입 거부 (409)
    seed_res2 = client.post("/api/v1/checklists/seed")
    assert seed_res2.status_code == 409
    assert seed_res2.json()["code"] == "SEED_ALREADY_APPLIED"

    # 시드 후 summary
    summary_res = client.get("/api/v1/checklists/summary")
    assert summary_res.status_code == 200
    assert summary_res.json()["total"] == 20


def test_categories_and_health(client):
    cat_res = client.get("/api/v1/categories")
    assert cat_res.status_code == 200
    cats = cat_res.json()
    assert len(cats) == 7
    values = [c["value"] for c in cats]
    assert "VENUE" in values
    assert "ETC" in values

    health_res = client.get("/api/v1/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "ok"
