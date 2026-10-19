# 결혼 준비 D-Day 및 필수 체크리스트 관리 서비스

결혼식까지 남은 D-Day 카운팅과 카테고리별 필수 체크리스트를 관리하는 풀스택 웹 애플리케이션입니다.

## 기술 스택
- **Backend**: FastAPI, SQLAlchemy (SQLite), Pydantic v2, Pytest
- **Frontend**: Next.js 14+ (App Router, TypeScript), TailwindCSS, TanStack Query v5, Lucide React

## 실행 방법

### 1. 백엔드 (FastAPI)
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
- Swagger API 문서: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health

### 2. 프론트엔드 (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- 웹 접속: http://localhost:3000

## 테스트 및 검증
- 백엔드 테스트: `cd backend && pytest`
- 프론트엔드 빌드: `cd frontend && npm run build`
