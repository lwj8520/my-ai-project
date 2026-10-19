from datetime import date
from app.services.dday_service import compute_dday


def test_dday_not_set(client):
    response = client.get("/api/v1/settings/d-day")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "NOT_SET"
    assert data["wedding_date"] is None
    assert data["d_day"] is None
    assert data["label"] is None


def test_dday_calculation_units():
    # 자정 경계 및 상태별 검증
    ref_today = date(2026, 10, 17)

    # 미래
    res_future = compute_dday(date(2026, 10, 18), today=ref_today)
    assert res_future["status"] == "UPCOMING"
    assert res_future["d_day"] == 1
    assert res_future["label"] == "D-1"

    # 당일
    res_today = compute_dday(date(2026, 10, 17), today=ref_today)
    assert res_today["status"] == "TODAY"
    assert res_today["d_day"] == 0
    assert res_today["label"] == "D-Day"

    # 과거
    res_past = compute_dday(date(2026, 10, 16), today=ref_today)
    assert res_past["status"] == "PASSED"
    assert res_past["d_day"] == -1
    assert res_past["label"] == "D+1"

    # PRD 예시
    res_prd = compute_dday(date(2026, 10, 17), today=date(2026, 6, 11))
    assert res_prd["status"] == "UPCOMING"
    assert res_prd["d_day"] == 128
    assert res_prd["label"] == "D-128"


def test_update_and_get_wedding_date(client):
    # 날짜 설정
    put_res = client.put("/api/v1/settings/wedding-date", json={"wedding_date": "2026-10-17"})
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["wedding_date"] == "2026-10-17"
    assert data["status"] in ["UPCOMING", "TODAY", "PASSED"]

    # 조회
    get_res = client.get("/api/v1/settings/d-day")
    assert get_res.status_code == 200
    assert get_res.json()["wedding_date"] == "2026-10-17"

    # 2회차 수정
    put_res2 = client.put("/api/v1/settings/wedding-date", json={"wedding_date": "2027-01-01"})
    assert put_res2.status_code == 200
    assert put_res2.json()["wedding_date"] == "2027-01-01"


def test_invalid_date_format(client):
    res1 = client.put("/api/v1/settings/wedding-date", json={"wedding_date": "2026-13-40"})
    assert res1.status_code == 422

    res2 = client.put("/api/v1/settings/wedding-date", json={"wedding_date": "invalid-date"})
    assert res2.status_code == 422


def test_delete_wedding_date_idempotent(client):
    # 설정 후 삭제
    client.put("/api/v1/settings/wedding-date", json={"wedding_date": "2026-10-17"})
    del_res1 = client.delete("/api/v1/settings/wedding-date")
    assert del_res1.status_code == 204

    get_res = client.get("/api/v1/settings/d-day")
    assert get_res.json()["status"] == "NOT_SET"
    assert get_res.json()["wedding_date"] is None

    # 재삭제(멱등성)
    del_res2 = client.delete("/api/v1/settings/wedding-date")
    assert del_res2.status_code == 204
