def test_create_and_get_memo(client):
    res = client.post(
        "/api/v1/memos",
        json={
            "title": "  웨딩홀 투어 후기  ",
            "memo_date": "2026-10-15",
            "tags": ["#예식장", "투어", "#후기"],
            "groom_content": "### 신랑 의견\n- 주차장이 넓어서 마음에 듦.\n- 밥이 맛있다고 함.",
            "bride_content": "### 신부 의견\n- 버진로드가 길고 조명이 화려해서 좋았음.\n- 꽃장식 추가 비용 확인 필요!",
        },
    )
    assert res.status_code == 201
    assert "Location" in res.headers
    data = res.json()
    assert data["title"] == "웨딩홀 투어 후기"  # trimmed
    assert data["memo_date"] == "2026-10-15"
    assert data["tags"] == ["예식장", "투어", "후기"]  # '#' 제거 및 정리
    assert "주차장" in data["groom_content"]
    assert "버진로드" in data["bride_content"]

    # 단건 조회
    memo_id = data["id"]
    get_res = client.get(f"/api/v1/memos/{memo_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "웨딩홀 투어 후기"


def test_memo_validation(client):
    # 제목 누락
    assert client.post("/api/v1/memos", json={"memo_date": "2026-10-15"}).status_code == 422
    # 제목 공백만
    assert client.post("/api/v1/memos", json={"title": "   ", "memo_date": "2026-10-15"}).status_code == 422
    # 날짜 누락
    assert client.post("/api/v1/memos", json={"title": "제목"}).status_code == 422


def test_memo_filtering_and_sorting(client):
    client.post(
        "/api/v1/memos",
        json={
            "title": "과거 메모",
            "memo_date": "2026-09-01",
            "tags": ["스드메"],
            "groom_content": "수트 셀렉 완료",
        },
    )
    client.post(
        "/api/v1/memos",
        json={
            "title": "최신 메모",
            "memo_date": "2026-10-01",
            "tags": ["예식장"],
            "bride_content": "계약금 납부",
        },
    )

    # 기본 목록: 최신 날짜(2026-10-01) 우선
    res = client.get("/api/v1/memos")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 2
    assert items[0]["title"] == "최신 메모"
    assert items[1]["title"] == "과거 메모"

    # 태그 필터링
    res_tag = client.get("/api/v1/memos?tag=스드메")
    assert len(res_tag.json()) == 1
    assert res_tag.json()[0]["title"] == "과거 메모"

    # 키워드 검색 (신부 내용 검색)
    res_q = client.get("/api/v1/memos?q=계약금")
    assert len(res_q.json()) == 1
    assert res_q.json()[0]["title"] == "최신 메모"


def test_memo_update_and_delete(client):
    create_res = client.post(
        "/api/v1/memos",
        json={
            "title": "초기 제목",
            "memo_date": "2026-10-10",
            "groom_content": "초기 신랑 내용",
        },
    )
    memo_id = create_res.json()["id"]

    # 신부 내용 추가 및 제목 수정
    patch_res = client.patch(
        f"/api/v1/memos/{memo_id}",
        json={
            "title": "수정된 제목",
            "bride_content": "신부도 의견 추가함!",
        },
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["title"] == "수정된 제목"
    assert updated["groom_content"] == "초기 신랑 내용"
    assert updated["bride_content"] == "신부도 의견 추가함!"

    # 삭제
    del_res = client.delete(f"/api/v1/memos/{memo_id}")
    assert del_res.status_code == 204

    # 404 확인
    get_404 = client.get(f"/api/v1/memos/{memo_id}")
    assert get_404.status_code == 404
    assert get_404.json()["code"] == "MEMO_NOT_FOUND"
